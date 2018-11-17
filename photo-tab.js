const LS_KEY = 'photo-cache-v20181101';

const getPhotoCache = () => {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    return JSON.parse(raw);
  } else {
    return null;
  }
};

const preloadNextPhoto = (photo) => {
  document.querySelector('#next-photo').src = photo.url;
};

const updatePhotoCache = (photos) => {
  preloadNextPhoto(photos[0]);
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
      const photo = photos.shift();
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

const filterOutHugePhotos = (photos) => {
  return Promise.all(photos.map((photo) => {
    return fetch(photo.url, { method: 'head', mode: 'no-cors' }).then((response) => {
      if (response.status !== 200) {
        ;
        throw new Error(`Unexpected response HEAD ${photo.url}: HTTP ${response.status}`);
      }
      const sizeInBytes = response.headers.get('content-length') || -1;
      return Object.assign({}, photo, { sizeInBytes });
    })
  })).then((photos) => {
    return photos.filter((p) => p.sizeInBytes < 6000000);
  });
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
    }).then((photos) => {
      return filterOutHugePhotos(photos);
    })
  };

const showPhoto = (photo) => {
  document.querySelector('body').style.backgroundImage = `url('${photo.url}')`;
  document.querySelector('#title').innerText = photo.title;
  document.querySelector('#title').href = photo.permalink;
  document.querySelector('#author').innerText  = photo.author;
};

const onNewTab = () => withNextPhoto().then((p) => showPhoto(p))

onNewTab();