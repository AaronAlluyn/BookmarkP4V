function NavigateDepot(path) {
    p4vjs.writeLog(p4vjs.LogType.INFO, "Navigating to depot tree path: " + path);
    p4vjs.setSelection([ path ]);
}

function CreateItem(path) {
    // Split the path into the three parts
    var parts = path.split('/');
    var textStream = '//' + parts[1] + '/' + parts[2] + '/';
    var textName = parts.pop();

    // Create a new list item
    var listItem = document.createElement('div');
    listItem.className = 'listItem';
    listItem.addEventListener('click', function() {
        NavigateDepot(path);
    });
    
    // Create the three parts of the list item
    var streamElement = document.createElement('div');
    streamElement.className = 'textStream';
    streamElement.textContent = textStream;
    listItem.appendChild(streamElement);

    var nameElement = document.createElement('div');
    nameElement.className = 'textName';
    nameElement.textContent = textName;
    listItem.appendChild(nameElement);

    var pathElement = document.createElement('div');
    pathElement.className = 'textPath';
    pathElement.textContent = '(' + path + ')';
    listItem.appendChild(pathElement);

    // Create the delete button
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.addEventListener('click', function(event) {
        // Prevent the list item click event from firing
        event.stopPropagation();

        // Remove the item from localStorage
        var storedPaths = JSON.parse(localStorage.getItem('paths')) || [];
        var index = storedPaths.indexOf(path);
        if (index !== -1) {
            storedPaths.splice(index, 1);
            localStorage.setItem('paths', JSON.stringify(storedPaths));
        }

        // Remove the list item from the list
        listItem.remove();
    });
    listItem.appendChild(deleteButton);

    return listItem;
}

document.getElementById('addButton').addEventListener('click', function() {
    var pathInput = document.getElementById('pathInput');
    var pathList = document.getElementById('pathList');
    var newPath = pathInput.value;
    if (newPath) {
        // Store the new path in localStorage
        var storedPaths = JSON.parse(localStorage.getItem('paths')) || [];
        storedPaths.push(newPath);
        localStorage.setItem('paths', JSON.stringify(storedPaths));

        // Add the new list item to the list
        var listItem = CreateItem(newPath);
        pathList.appendChild(listItem);

        // Clear the input field
        pathInput.value = '';
    }
});

// Load any paths stored in localStorage when the page loads
window.onload = function() {
    var storedPaths = JSON.parse(localStorage.getItem('paths')) || [];
    var pathList = document.getElementById('pathList');
    for (var i = 0; i < storedPaths.length; i++) {
        var listItem = CreateItem(storedPaths[i]);
        pathList.appendChild(listItem);
    }
};
