function NavigateDepot(path) {
    p4vjs.writeLog(p4vjs.LogType.INFO, "Navigating to depot path: " + path);
}

document.getElementById('addButton').addEventListener('click', function() {
    var pathInput = document.getElementById('pathInput');
    var pathList = document.getElementById('pathList');
    var newPath = pathInput.value;
    if (newPath) {
        var option = document.createElement('option');
        option.text = newPath;
        pathList.add(option);
        pathInput.value = '';

        // Store the new path in localStorage
        var storedPaths = JSON.parse(localStorage.getItem('paths')) || [];
        storedPaths.push(newPath);
        localStorage.setItem('paths', JSON.stringify(storedPaths));
    }
});

document.getElementById('pathList').addEventListener('click', function() {
    var pathList = document.getElementById('pathList');
    var selectedPath = pathList.options[pathList.selectedIndex].text;
    NavigateDepot(selectedPath);
});

// Load any paths stored in localStorage when the page loads
window.onload = function() {
    var storedPaths = JSON.parse(localStorage.getItem('paths')) || [];
    var pathList = document.getElementById('pathList');
    for (var i = 0; i < storedPaths.length; i++) {
        var option = document.createElement('option');
        option.text = storedPaths[i];
        pathList.add(option);
    }
};
