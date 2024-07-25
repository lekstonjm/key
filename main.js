window.onload = () => {
    'use strict';
    const urlSearchParams = new URLSearchParams(window.location.search.replace('/\/*$/',''));
    if (!urlSearchParams.has('metered_id'))
    {
      alert('please enter a metered id');
    }
    const key = urlSearchParams.get('metered_id');
    alert(key);
    async function loadIceServers() {
      const response = await fetch(
        "https://your-app-name.metered.live/api/v1/turn/credentials?apiKey=" +
        key
      );
      const iceServers = await response.json();
      alert(JSON.stringify(iceServers));
      document.getElementById("ice-servers").value = JSON.stringify(iceServers);
    }
    
    loadIceServers();
  }