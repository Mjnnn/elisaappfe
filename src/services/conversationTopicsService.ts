import apiService from "./apiService";
import { AxiosResponse } from "axios";
import { EnglishConversationTopicsResponse } from "../types/response/EnglishConversationTopicsResponse";

const BASE_URL = "/conversation-topics";

const conversationTopicsService = {

    getTopicById: (topicId: number): Promise<AxiosResponse<EnglishConversationTopicsResponse>> =>
    apiService.get(`${BASE_URL}/${topicId}`),

    getAllTopics: (): Promise<AxiosResponse<EnglishConversationTopicsResponse[]>> =>
    apiService.get(`${BASE_URL}/list-topics`),
};

export default conversationTopicsService;