import apiService from "./apiService";
import { AxiosResponse } from "axios";

const BASE_URL = "/chatbot";

const chatbotService = {

  pushMessage: (data: FormData) =>
    apiService.post(`${BASE_URL}/voice/`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};

export default chatbotService;