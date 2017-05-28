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
            $(go.Shape, "Rectangle", {stroke: "transparent", fill: "#8FC"}),
            $(go.TextBlock, {margin: 8}, new go.Binding("text", "username")),
        ),
        $(go.TextBlock, {margin: 8}, new go.Binding("text", "message"))
    )
);

var model = $(go.TreeModel);
diagram.model = model;

username = document.getElementById("username");
textBox = document.getElementById("message");
sendButton = document.getElementById("send");

textBox.onkeypress = function(event) {
    if (event.keyCode == 13 && !event.shiftKey) {
        sendButton.click();
        event.preventDefault();
    }
};



var socket = io();

send.onclick = function() {
    if (username.value == "" || textBox.value == "") return;
    socket.emit("chat message", {username: username.value, message: textBox.value});
    textBox.value = "";
};

socket.on('chat message', function(data) {
    n = model.nodeDataArray.length;
    model.addNodeData({ key: n+1, parent: n, username: data.username, message: data.message });
});

