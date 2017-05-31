var $ = go.GraphObject.make;
var diagram = $(go.Diagram, "diagramDiv", {
    initialContentAlignment: go.Spot.Center,
    layout: $(go.TreeLayout, {angle: 90, layerSpacing: 20}),
    "animationManager.isInitial": false
});
diagram.isReadOnly = true;

diagram.linkTemplate = $(go.Link, $(go.Shape));

diagram.nodeTemplate = $(go.Node, "Auto",
    $(go.Shape, "Rectangle", {stroke: "#333", fill: "#8CF"}),
    $(go.Panel, "Horizontal",
        $(go.Panel, "Auto", {stretch: go.GraphObject.Vertical},
            $(go.Shape, "Rectangle", {stroke: null, fill: "#8FC"}),
            $(go.TextBlock, {margin: 8}, new go.Binding("text", "nickname")),
        ),
        $(go.TextBlock, {margin: 8}, new go.Binding("text", "message"))
    ),
    { toolTip: $(go.Adornment, "Auto",
            $(go.Shape, "RoundedRectangle", {fill: "#FFF", stroke: null}),
            $(go.TextBlock, new go.Binding("text", "timestamp"))
    ) }
);

diagram.nodeTemplate.contextMenu = $(go.Adornment, "Vertical",
    $("ContextMenuButton",
        $(go.TextBlock, "Mark as segue"),
        {click: function(e, obj) {
                    var n = obj.part.adornedPart.data;
                    socket.emit("new topic", n.message)
                }
        }
    )
);

var model = $(go.TreeModel);
diagram.model = model;


var textBox = document.getElementById("message");
var sendButton = document.getElementById("send");
var topicDropdown = document.getElementById("topics");

textBox.onkeypress = function(event) {
    if (event.keyCode == 13 && !event.shiftKey) {
        sendButton.click();
        event.preventDefault();
    }
};


var socket = io();

var nickname = prompt("What is your name?") || "Guest";
socket.emit("introduction", nickname);

send.onclick = function() {
    if (textBox.value == "") return;
    socket.emit("chat message", {
        message: textBox.value,
        topic: topicDropdown.value
    });
    textBox.value = "";
};

let leaves = {}

socket.on("new topic", function(data) {
    if (leaves[data.topic] !== undefined) return; // topic already exists

    model.addNodeData({
        key: data.topic + 0,
        nickname: "New Topic",
        message: data.topic,
        timestamp: data.timestamp
    });

    let option = document.createElement("option");
    option.text = data.topic;
    topicDropdown.add(option)

    leaves[data.topic] = 0;
});

socket.on("chat message", function(data) {
    let topic = data.topic
    let n = leaves[topic]++;
    model.addNodeData({
        key:       topic + (n+1),
        parent:    topic + n,
        nickname:  data.nickname,
        message:   data.message,
        timestamp: data.timestamp
    });
    //leaves[topic]++;
});

// note: not handling the "introduction" or "disconnect" events


socket.emit("new topic", "Main");

