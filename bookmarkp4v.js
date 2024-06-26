function NavigateDepot(path) {
    p4vjs.writeLog(p4vjs.LogType.INFO, "Navigating to depot tree path: " + path);
    p4vjs.setSelection([ path ]);
}

function CreateItem(path) {
    if (!path.startsWith('//') || path.length <= 2) {
        return null;
    }
    
    // Split the path into the three parts
    var parts = path.split('/');
    
    var textStream = '//' + parts[2];
    if (parts.length > 3) {
        textStream += '/' + parts[3];
    }
    textStream += '/';
    
    var textName = parts.pop();

    // Create a new list item
    var listItem = document.createElement('div');
    listItem.className = 'listItem';
    listItem.id = path
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
    pathElement.textContent = path;
    listItem.appendChild(pathElement);

    // Create the delete button
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.addEventListener('click', function(event) {
        // Prevent the list item click event from firing
        event.stopPropagation();

        RemoveLocalStorageItem(path);
        listItem.remove();
    });
    listItem.appendChild(deleteButton);

    // Make the list item draggable
    listItem.draggable = true;

    // Add dragstart event listener to the list item
    listItem.addEventListener('dragstart', function(event) {
        event.dataTransfer.setData('text/plain', event.target.id);
    });
    
    return listItem;
}

function CreateGroupItem(groupName) {
    // Create a new group item
    var groupItem = document.createElement('div');
    groupItem.className = 'listItemGroup';
    groupItem.textContent = groupName.replace("group.", "");
    groupItem.id = groupName;

    // Create the delete button for groups
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.addEventListener('click', function(event) {
        // Prevent the group item click event from firing
        event.stopPropagation();

        RemoveLocalStorageItem(groupName);
        groupItem.remove();
    });
    groupItem.appendChild(deleteButton);

    // Group items are not draggable
    groupItem.draggable = true;

    // Add dragstart event listener to the list item
    groupItem.addEventListener('dragstart', function(event) {
        event.dataTransfer.setData('text/plain', event.target.id);
    });

    return groupItem;
}

function UpdateLocalStorage(pathList) {
    const paths = [];
    for (const item of pathList.children) {
        if (item.id) {
            paths.push(item.id);
        }
    }
    
    console.log(pathList)
    localStorage.setItem('bookmarkp4v.items', JSON.stringify(paths));
}

function RemoveLocalStorageItem(path) {
    var storedPaths = JSON.parse(localStorage.getItem('bookmarkp4v.items')) || [];
    var index = storedPaths.indexOf(path);
    if (index !== -1) {
        storedPaths.splice(index, 1);
        localStorage.setItem('bookmarkp4v.items', JSON.stringify(storedPaths));
    }
}

document.getElementById('addButton').addEventListener('click', function() {
    p4vjs.getSelection().then(pathInputs => {
        pathInputs = pathInputs.split(',');
        if (pathInputs == null || pathInputs.length == 0) {
            console.log("no paths selected")
            return;
        }
    
        var pathList = document.getElementById('pathList');

        pathInputs.forEach(newPath => {
            newPath = newPath.replace('p4:///files', '/');
            if (newPath != null) {
                var listItem = CreateItem(newPath);
                if (listItem != null) {
                    pathList.appendChild(listItem);
                }
            }
        });

        UpdateLocalStorage(pathList);
    }).catch(error => {
        console.error('Error:', error);
    });
    
});

document.getElementById('addGroupButton').addEventListener('click', function() {
    var groupName = prompt('Enter group name:');
    if (groupName) {
        groupName = "group." + groupName;
        var groupItem = CreateGroupItem(groupName);
        if (groupItem) {
            pathList.appendChild(groupItem);
            UpdateLocalStorage(pathList);
        }
    }
});

document.getElementById('exportButton').addEventListener('click', function() {
    var pathList = document.getElementById('pathList');
    var jsonData = document.getElementById('jsonData');

    var storedPaths = JSON.parse(localStorage.getItem('bookmarkp4v.items')) || [];
    var dataStr = JSON.stringify(storedPaths);

    if (pathList.style.display === "none") {
        pathList.style.display = "block";
        jsonData.style.display = "none";
    } else {
        pathList.style.display = "none";
        jsonData.textContent = dataStr;
        jsonData.style.display = "block";
    }
});

document.getElementById('importButton').addEventListener('click', function() {
    var dataStr = prompt("Please paste your data:");

    if (dataStr != null) {
        var data = JSON.parse(dataStr);
        localStorage.setItem('bookmarkp4v.items', JSON.stringify(data));
        location.reload();
    }

});

document.getElementById('pathList').addEventListener('dragover', function(event) {
    event.preventDefault();
});

document.getElementById('pathList').addEventListener('drop', function(event) {
    event.preventDefault();
    var id = event.dataTransfer.getData('text/plain');
    var draggedElement = document.getElementById(id);
    var dropTarget = event.target.closest('.listItem, .listItemGroup');
    var container = event.target.closest('#pathList');
    container.insertBefore(draggedElement, dropTarget.nextSibling);

    // Update localStorage
    var updatedPaths = Array.from(container.children).map(function(listItem) {
        return listItem.id;
    });
    localStorage.setItem('bookmarkp4v.items', JSON.stringify(updatedPaths));
});

// Load any paths stored in localStorage when the page loads
window.onload = function() {
    var storedPaths = JSON.parse(localStorage.getItem('bookmarkp4v.items')) || [];
    var pathList = document.getElementById('pathList');
    for (var i = 0; i < storedPaths.length; i++) {
        var listItem = null;
        if (storedPaths[i].startsWith("group.")) {
            listItem = CreateGroupItem(storedPaths[i]);
        } else {
            listItem = CreateItem(storedPaths[i]);
        }

        if (listItem != null) {
            pathList.appendChild(listItem);
        }
    }
};
