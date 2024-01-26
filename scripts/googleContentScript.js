// googleContentScript.js
// This script is injected into Google search pages to scrape related searches and display them in a custom popup.

// CSS for the popup design
const popupStyle = document.createElement('style');
popupStyle.textContent = `
  #popup-container {
    background-color: #202124; /* Dark background of the popup */
    padding: 20px;
    border-radius: 10px;
    display: grid; /* Use grid display */
    grid-template-columns: repeat(2, 1fr); /* Create two columns */
    gap: 10px; /* Add a gap between grid items */
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  }

  #popup-banner {
    grid-column: 1 / -1; /* This will make the image span all columns */
    width: 200px; /* Maintain the image's aspect ratio */
    max-width: 100%; 
    height: auto; /* Maintain the image's aspect ratio */
    border-radius: 50% ;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto; 
  }

  #popup-banner:hover {
    cursor: pointer;
  }

  #popup-title {
    grid-column: 1 / -1; /* Full width */
    text-align: center;
    font-size: 1.2em;
    margin-bottom: 10px;
    color: #fff;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 15px;
    border: none;
    background: none;
    color: #fff;
    font-size: 1.5em;
    cursor: pointer;
  }

  .search-item {
    background-color: #303134; /* Lighter background for buttons */
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    text-align: center; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
  }

  .search-item:hover {
    background-color: #555; /* Hover effect */
  }

  .search-icon {
    margin-left: 5px;
    margin-right: 10px;
    font-size: 0.8em;
  }
`;
document.head.appendChild(popupStyle);

// Function to scrape related searches
function scrapeRelatedSearches() {
  const relatedSearches = document.querySelectorAll("a.k8XOCe.R0xfCb.VCOFK.s8bAkb");
  console.log("Related Searches Found:", relatedSearches.length);
  const searchTerms = Array.from(relatedSearches, search => search.querySelector("div.s75CSd.u60jwe.r2fjmd.AB4Wff").textContent);
  openPopupWithSearchTerms(searchTerms);
}

// Function to create and open the popup with the related search terms
function openPopupWithSearchTerms(searchTerms) {
  // Create the popup container
  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container";

  // Add banner image to the popup
  const bannerImage = document.createElement("img");
  bannerImage.id = "popup-banner";
  bannerImage.src = "https://s3.tebi.io/couponbuddy-chrome-extension-assets/buddy-search.png";
  bannerImage.onerror = function() {
    // Fallback to local image if loading from the URL fails
    this.onerror = null; // Prevents infinite loop in case local image also fails to load
    this.src = chrome.runtime.getURL("images/BuddyBanner.png");
  };
  bannerImage.alt = "Buddy Banner";
  bannerImage.onclick = handleBannerImageClick;
  popupContainer.appendChild(bannerImage);

  // Add title to the popup
  const popupTitle = document.createElement("div");
  popupTitle.id = "popup-title";
  popupTitle.textContent = "🦴 Sniff out these fetching results 🦴";
  popupContainer.appendChild(popupTitle);

  // Add close button to the popup
  const closeButton = document.createElement("button");
  closeButton.className = "close-button";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => document.body.removeChild(popupContainer);
  popupContainer.appendChild(closeButton);

  // Add search items to the popup
  searchTerms.forEach(term => {
    const searchItem = document.createElement("button");
    searchItem.className = "search-item";
    searchItem.innerHTML = `${term}<span class="search-icon">🔍</span>`;
    searchItem.onclick = () => window.open(`https://www.bing.com/search?q=${encodeURIComponent(term)}`, "_blank");
    popupContainer.appendChild(searchItem);
  });

  // Add the popup to the document
  document.body.appendChild(popupContainer);
}

// Function to handle banner image click
function handleBannerImageClick() {
  // Get the search query from the search box
  const searchBox = document.querySelector('textarea#APjFqb');
  const searchQuery = searchBox ? searchBox.value : '';

  // Open the search query in a new tab in Bing search
  window.open(`https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
}

// Function to start polling for the related searches
function pollForRelatedSearches() {
  const intervalId = setInterval(() => {
    if (document.querySelector("a.k8XOCe.R0xfCb.VCOFK.s8bAkb")) {
      clearInterval(intervalId);
      scrapeRelatedSearches();
    }
  }, 500);
}

// Start the polling function when the script loads
pollForRelatedSearches();
