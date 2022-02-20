import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';

const API_KEY = 'key=25800724-0fdd1a7ce828887932688c52c';
const MAIN_DOMAIN = 'https://pixabay.com/api/';
const PARAMETERS = 'image_type=photo&orientation=horizontal&safesearch=true';
const PER_PAGE = 'per_page=40';


const fetchImages = async (value, page) => {
  const response = await axios.get(`?${API_KEY}&q=${value}&${PARAMETERS}&page=${page}&${PER_PAGE}`);
  return response.data;
};

export { fetchImages };
