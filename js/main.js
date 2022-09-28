'use strict';
// Element Selectors
const searchInput = document.getElementById('searchBar');
const allLinks = document.getElementById('allLinks');
const delButton = document.getElementById('deleteBtn');
const renameButton = document.getElementById('renameBtn');
const cards = document.querySelector('.nav').children;
const removeArr = [];
let renamedArr;
let currentLinks;

// Runs all of the display setups
class Setup {
  constructor() {
    this.displayLinks();
    this.searchBar();
  }

  // Loads Links from Local Storage and Displays the links
  displayLinks() {
    let self = this;
    chrome.storage.sync.get(['name'], function (response) {
      renamedArr = response.name ?? [];
      chrome.storage.sync.get(['key'], function (result) {
        const newLinks = result.key ?? [];
        newLinks.forEach((cur, ind) => {
          if (!renamedArr[ind]) renamedArr.push(newLinks[ind]);
          const filteredUrl = renamedArr[ind]
            ? renamedArr[ind]
            : cur.slice(0, 32);
          removeArr.push(newLinks[ind]);
          if (allLinks) {
            allLinks.innerHTML += `<li class="links"><a href="${newLinks[ind]}"> ${filteredUrl}</a></li>`;
          }
        });
        self.eventhandlers();
      });
    });
  }

  // Gives each link an event listener for selection and deletion
  eventhandlers() {
    const activeLinks = document.querySelectorAll('.links');
    activeLinks.forEach((cur) => {
      cur.addEventListener('click', (e) => {
        e.preventDefault();
        const url = cur.children[0].getAttribute('href');
        navigator.clipboard.writeText(url);
        this.sendMessage(url);
      });
      cur.addEventListener('dblclick', (e) => {
        if (cur.classList.contains('sel')) {
          cur.classList.remove('sel');
        } else {
          cur.classList.add('sel');
        }
      });
      delButton.addEventListener('click', (e) => {
        if (cur.classList.contains('sel')) {
          const newStore = this.removeDel(removeArr, cur);
          this.setStorage('key', newStore);
          this.setStorage('name', renamedArr);
          cur.remove();
        }
      });
      renameButton.addEventListener('click', (e) => {
        if (cur.classList.contains('sel')) {
          this.renameLink(renamedArr, cur);
          cur.classList.remove('sel');
        }
      });
    });
  }

  // Search Function
  searchBar() {
    if (searchInput) {
      searchInput.addEventListener('keydown', function () {
        currentLinks = document.querySelectorAll('.links');
        currentLinks.forEach((cur) => {
          const phrase = cur.textContent
            .toLowerCase()
            .includes(searchInput.value.toLowerCase());
          cur.style.display = phrase ? 'list-item' : 'none';
        });
      });
    }
  }
  // Sends a message with the url to the content script
  // This allows the content script to inject the link into the selected element
  async sendMessage(url) {
    let queryOptions = { active: true, currentWindow: true };
    let tabs = await chrome.tabs.query(queryOptions);
    chrome.tabs.sendMessage(tabs[0].id, { process: url }, function () {
      let lastError = chrome.runtime.lastError;
      if (lastError) {
        return;
      }
    });
  }
  removeDel(delArray, delLink) {
    const filteredLink = delLink.children[0].getAttribute('href');
    if (delArray.includes(filteredLink)) {
      const delInd = delArray.indexOf(filteredLink);
      renamedArr.splice(delInd, 1);
      delArray.splice(delInd, 1);
      return delArray;
    }
  }

  renameLink(renamedArr, el) {
    let self = this;
    // filters out the beginning space and grabs the index of the link
    const cleanLink = el.children[0].innerHTML.split(' ').join('');
    const index = renamedArr.indexOf(`${cleanLink}`);
    // Injects an input bar into the popup so they can rename it
    el.children[0].innerHTML = `<input id="renameIN" type="text"> `;
    document.getElementById('renameIN').focus();
    // Grabs the el
    const renamedLink = document.getElementById('renameIN');
    renamedLink.addEventListener('keyup', function (e) {
      if (e.key === 'Enter' && renamedLink.value) {
        renamedArr[index] = renamedLink.value;
        el.children[0].textContent = renamedLink.value;
        self.setStorage('name', renamedArr);
        renamedLink.remove();
      }
    });
  }
  setStorage(keyName, value) {
    chrome.storage.sync.set({ [`${keyName}`]: value }, function () {});
  }
}

const setUp = new Setup();
