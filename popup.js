function clearLink() {
  document.getElementById('link').value = '';
}

function clearNote() {
  document.getElementById('note').value = '';
}

function saveLink() {
  const linkInput = document.getElementById('link');
  const noteInput = document.getElementById('note');
  const link = linkInput.value;
  const note = noteInput.value;

  if (link && note) {
    chrome.storage.sync.get({ links: [] }, function(data) {
      const links = data.links;
      if (currentEditIndex !== null) {
        
        links[currentEditIndex] = { link, note };
        currentEditIndex = null; 
      } else {
        
        links.push({ link, note });
      }
      chrome.storage.sync.set({ links }, function() {
        displayLinks();
        linkInput.value = '';
        noteInput.value = '';
      });
    });
  }
}

function displayLinks() {
  chrome.storage.sync.get({ links: [] }, function(data) {
    const linkList = document.getElementById('link-list');
    linkList.innerHTML = '';
    const links = data.links || [];
    links.forEach(function(item, index) {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${item.link}" target="_blank">${item.link}</a>
        <p>${item.note}</p>
        <div class="actions">
          <button class="edit-button" data-index="${index}">Edit</button>
          <button class="delete-button" data-index="${index}">Delete</button>
        </div>
      `;
      linkList.appendChild(li);
    });
  });
}

function filterLinks() {
  const searchQuery = document.getElementById('search').value.toLowerCase();
  const links = document.querySelectorAll('#link-list li');
  links.forEach(link => {
    const text = link.textContent.toLowerCase();
    if (text.includes(searchQuery)) {
      link.style.display = '';
    } else {
      link.style.display = 'none';
    }
  });
}

function fetchCurrentURL() {
  chrome.runtime.sendMessage({ action: 'getCurrentTabUrl' }, function(response) {
    if (response.error) {
      console.error('Error fetching URL:', response.error);
    } else {
      document.getElementById('link').value = response.url;
    }
  });
}

function editLink(index) {
  console.log('Editing link at index:', index);
  chrome.storage.sync.get({ links: [] }, function(data) {
    const links = data.links;
    if (links[index]) {
      document.getElementById('link').value = links[index].link;
      document.getElementById('note').value = links[index].note;
      currentEditIndex = index; 
    } else {
      console.error('No link found at index:', index);
    }
  });
}

function deleteLink(index) {
  console.log('Deleting link at index:', index);
  chrome.storage.sync.get({ links: [] }, function(data) {
    const links = data.links;
    links.splice(index, 1);
    chrome.storage.sync.set({ links }, function() {
      displayLinks();
    });
  });
}

let currentEditIndex = null;

document.getElementById('link-form').addEventListener('submit', function(event) {
  event.preventDefault();
  saveLink();
});

document.getElementById('search').addEventListener('input', filterLinks);

document.getElementById('fetch-url').addEventListener('click', fetchCurrentURL);

document.getElementById('clear-link').addEventListener('click', clearLink);
document.getElementById('clear-note').addEventListener('click', clearNote);

document.getElementById('link-list').addEventListener('click', (event) => {
  const target = event.target;
  if (target.classList.contains('edit-button')) {
    const index = parseInt(target.getAttribute('data-index'), 10);
    console.log('Edit button clicked, index:', index); 
    editLink(index);
  } else if (target.classList.contains('delete-button')) {
    const index = parseInt(target.getAttribute('data-index'), 10);
    console.log('Delete button clicked, index:', index); 
    deleteLink(index);
  }
});

displayLinks();
