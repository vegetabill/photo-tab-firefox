const LS_KEY = 'photo-cache-v20181101';

const getPhotoCache = () => {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    return JSON.parse(raw);
  } else {
    return null;
  }
};

const updatePhotoCache = (photos) => {
  console.log(`loaded ${photos.length} new photos into cache`);
  localStorage.setItem(LS_KEY, JSON.stringify(photos));
};


const withPopulatedCache = () => {
  const cache = getPhotoCache();
  if (!cache || cache.length === 0) {
    return loadPhotos().then((photos) => {
      updatePhotoCache(photos);
      return photos;
    });
  } else {
    return Promise.resolve(cache);
  }
};

const withNextPhoto = () => {
  return withPopulatedCache()
    .then((photos) => {
      const photo = photos.pop();
      updatePhotoCache(photos);
      return photo;
    });
};

const extractPhotoAttrs = (child) => {
  const {
    name,
    url,
    title,
    permalink,
    author,
  } = child.data;
  return {
    name, // name is the unique id
    url,
    title,
    author,
    permalink: `https://www.reddit.com${permalink}`,
  };
};

const loadPhotos = () => {
  return fetch('https://www.reddit.com/r/earthporn.json')
    .then(function (response) {
      if (response.status !== 200) {;
        throw new Error(`Unexpected response from Reddit: HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(function (json) {
      const { children } = json.data;
      return children.map(extractPhotoAttrs);
    });
  };
  
const showPhoto = (photo) => {
  document.querySelector('#title').innerText = photo.title;
  document.querySelector('#photo').src = photo.url;
  document.querySelector('#author').src = photo.author;
};

withNextPhoto().then((p) => showPhoto(p));