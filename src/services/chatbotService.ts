import apiService from "./apiService";
import { AxiosResponse } from "axios";
import { EnglishChatbotResponse, EnglishCheckMessageResponse } from "../types/response/ChatbotResponse";

const BASE_URL = "/chatbot";

const chatbotService = {

  pushMessageVoice: (data: FormData) =>
    apiService.post(`${BASE_URL}/voice`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),

    pushMessageText: (data: any ): Promise<AxiosResponse<EnglishChatbotResponse>> =>
      apiService.post(`${BASE_URL}/text`, data),

    checkGrammarMessage: (data: any ): Promise<AxiosResponse<EnglishCheckMessageResponse>> =>
      apiService.post(`${BASE_URL}/grammar-reply`, data),


};

export default chatbotService;