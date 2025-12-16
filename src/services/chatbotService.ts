import apiService from "./apiService";
import { AxiosResponse } from "axios";

const BASE_URL = "/chatbot";

const chatbotService = {

  pushMessageVoice: (data: FormData) =>
    apiService.post(`${BASE_URL}/voice`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),

    pushMessageText: (data: any ) =>
      apiService.post(`${BASE_URL}/text`, data),


};

export default chatbotService;