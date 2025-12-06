import apiService from "./apiService";
import { AxiosResponse } from "axios";
import {UserXPResponse} from "../types/response/UserXPResponse";
import {UserXPRequest} from "../types/request/UserXPRequest";
import {RankingUserResponse} from "../types/response/RankingUserResponse";

const BASE_URL = "/english-user-xp";

const userXPService = {

  getUserXPByUserId: (userId: number): Promise<AxiosResponse<UserXPResponse>> =>
    apiService.get(`${BASE_URL}/${userId}`),

  updateUserXP: (data: UserXPRequest): Promise<AxiosResponse<UserXPResponse>> =>
    apiService.post(`${BASE_URL}/update`, data),

  createUserXP: (userId: number): Promise<AxiosResponse<UserXPResponse>> =>
    apiService.post(`${BASE_URL}/create/${userId}`, { userId }),

  getRankingUserXP: (): Promise<AxiosResponse<RankingUserResponse[]>> =>
    apiService.get(`${BASE_URL}/ranking`),
};

export default userXPService;