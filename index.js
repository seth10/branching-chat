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
                    model.addNodeData({
                        key: "branch"+n.parent,
                        parent: n.parent
                    });
                }
        }
    )
);

var model = $(go.TreeModel);
diagram.model = model;


var textBox = document.getElementById("message");
var sendButton = document.getElementById("send");

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
    socket.emit("chat message", textBox.value);
    textBox.value = "";
};

socket.on('chat message', function(data) {
    n = model.nodeDataArray.length;
    model.addNodeData({
        key: n+1,
        parent: n,
        nickname: data.nickname,
        message: data.message,
        timestamp: data.timestamp
    });
});

// note: not handling the "introduction" or "disconnect" events

