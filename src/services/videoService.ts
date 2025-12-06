import apiService from "./apiService";
import { AxiosResponse } from "axios";
import {VideoSummaryResponse, EnglishVideoResponse} from "../types/response/VideoResponse";

const BASE_URL = "/videos";

const videoService = {

  getVideoByLevel: (level: string): Promise<AxiosResponse<VideoSummaryResponse[]>> =>
    apiService.get(`${BASE_URL}/?level=${level}`),

  createVideo: (data: FormData): Promise<AxiosResponse<VideoSummaryResponse>> =>
    apiService.post(`${BASE_URL}/create`, data),

  deleteVideo: (id: number): Promise<AxiosResponse<void>> =>
      apiService.delete(`${BASE_URL}/delete/${id}`),

  updateVideo: (id: number, data: FormData): Promise<AxiosResponse<VideoSummaryResponse>> =>
      apiService.put(`${BASE_URL}/update/${id}`, data),

  getVideoById:(id: number): Promise<AxiosResponse<EnglishVideoResponse>> =>
    apiService.get(`${BASE_URL}/${id}`),
};

export default videoService;