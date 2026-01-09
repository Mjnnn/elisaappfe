import apiService from "./apiService";
import { AxiosResponse } from "axios";
import {PracticeResponse, EnglishListeningDictationResponse, EnglishClozeBlankResponse, EnglishClozeExerciseResponse, 
  EnglishParagraphSegmentResponse, EnglishOrderingExerciseResponse
} from "../types/response/ExerciseResponse";
import {EnglishMultipleChoiceRequest} from "../types/request/EnglishMultipleChoiceRequest";
import {EnglishMultipleChoiceResponse} from "../types/response/EnglishMultipleChoiceResponse";
import {EnglishListeningDictationRequest} from "../types/request/EnglishListeningDictationRequest";
import {EnglishClozeExerciseRequest} from "../types/request/EnglishClozeExerciseRequest";
import {EnglishOrderingExerciseRequest} from "../types/request/EnglishOrderingExerciseRequest";
import {DeleteResponse} from "../types/response/DeleteResponse";
import {EnglishSentenceRewritingRequest} from "../types/request/EnglishSentenceRewritingRequest";
import {EnglishSentenceRewritingResponse} from "../types/response/EnglishSentenceRewritingResponse";


const BASE_URL = "/english-exercise";

const exerciseService = {

  // Lấy danh sách từ vựng có phân trang
  getExercisesByLesson: (lessonId: number): Promise<AxiosResponse<PracticeResponse>> =>
    apiService.get(`${BASE_URL}/${lessonId}`),

  createMultipleQuestion: (
    lessonId: number, 
    data: EnglishMultipleChoiceRequest
  ): Promise<AxiosResponse<EnglishMultipleChoiceResponse>> => {
    return apiService.post(`${BASE_URL}/create/multiple/${lessonId}`, data);
  },

  updateMultipleQuestion: (
    questionId: number, 
    data: EnglishMultipleChoiceRequest
  ): Promise<AxiosResponse<EnglishMultipleChoiceResponse>> => {
    return apiService.put(`${BASE_URL}/update/multiple/${questionId}`, data);
  },

  deleteMultipleQuestion: (
    questionId: number
  ): Promise<AxiosResponse<DeleteResponse>> => {
    return apiService.delete(`${BASE_URL}/delete/multiple/${questionId}`);
  },


  createSentenceRewritingQuestion: (
    lessonId: number, 
    data: EnglishSentenceRewritingRequest
  ): Promise<AxiosResponse<EnglishSentenceRewritingResponse>> => {
    return apiService.post(`${BASE_URL}/create/sentence-rewriting/${lessonId}`, data);
  },

  updateSentenceRewritingQuestion: (
    questionId: number, 
    data: EnglishSentenceRewritingRequest
  ): Promise<AxiosResponse<EnglishSentenceRewritingResponse>> => {
    return apiService.put(`${BASE_URL}/update/sentence-rewriting/${questionId}`, data);
  },

  deleteSentenceRewritingQuestion: (
    questionId: number
  ): Promise<AxiosResponse<DeleteResponse>> => {
    return apiService.delete(`${BASE_URL}/delete/sentence-rewriting/${questionId}`);
  },

  getMultipleChoiceForChallenge:(lessonId: number): Promise<AxiosResponse<EnglishMultipleChoiceResponse[]>> =>{
    return apiService.get(`${BASE_URL}/challenge/multiple/${lessonId}`);
  },

  getSentenceRewritingForChallenge:(lessonId: number): Promise<AxiosResponse<EnglishSentenceRewritingResponse[]>> =>{
    return apiService.get(`${BASE_URL}/challenge/sentence-rewriting/${lessonId}`);
  },

  getListeningDictationForChallenge:(lessonId: number): Promise<AxiosResponse<EnglishListeningDictationResponse[]>> =>{
    return apiService.get(`${BASE_URL}/challenge/listening-dictation/${lessonId}`);
  },

  getClozeForChallenge:(lessonId: number): Promise<AxiosResponse<EnglishClozeExerciseResponse[]>> =>{
    return apiService.get(`${BASE_URL}/challenge/cloze/${lessonId}`);
  },

  getOrderingForChallenge:(lessonId: number): Promise<AxiosResponse<EnglishOrderingExerciseResponse[]>> =>{
    return apiService.get(`${BASE_URL}/challenge/ordering/${lessonId}`);
  },

  createListeningDictationQuestion: (
    lessonId: number, 
    data: EnglishListeningDictationRequest, 
    file: File 
): Promise<AxiosResponse<EnglishListeningDictationResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify(data));

    // 3. Gửi request
    return apiService.post(
        `${BASE_URL}/create/listening-dictation/${lessonId}`, 
        formData, 
        {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        }
    );
},

 updateListeningDictationQuestion: (
    questionId: number, 
    data: EnglishListeningDictationRequest
): Promise<AxiosResponse<EnglishListeningDictationResponse>> => {
    return apiService.put(`${BASE_URL}/update/listening-dictation/${questionId}`, data);
},

  deleteListeningDictationQuestion: (
    questionId: number
  ): Promise<AxiosResponse<DeleteResponse>> => {
    return apiService.delete(`${BASE_URL}/delete/listening-dictation/${questionId}`);
  },

  createClozeExerciseQuestion: (
    lessonId: number, 
    data: EnglishClozeExerciseRequest
  ): Promise<AxiosResponse<EnglishClozeExerciseResponse>> => {
    return apiService.post(`${BASE_URL}/create/cloze-exercise/${lessonId}`, data);
  },

  updateClozeExerciseQuestion: (
    questionId: number, 
    data: EnglishClozeExerciseRequest
  ): Promise<AxiosResponse<EnglishClozeExerciseResponse>> => {
    return apiService.put(`${BASE_URL}/update/cloze-exercise/${questionId}`, data);
  },

  deleteClozeExerciseQuestion: (
    questionId: number
  ): Promise<AxiosResponse<DeleteResponse>> => {
    return apiService.delete(`${BASE_URL}/delete/cloze-exercise/${questionId}`);
  },

  createOrderingExerciseQuestion: (
    lessonId: number, 
    data: EnglishOrderingExerciseRequest
  ): Promise<AxiosResponse<EnglishOrderingExerciseResponse>> => {
    return apiService.post(`${BASE_URL}/create/ordering-exercise/${lessonId}`, data);
  },

  updateOrderingExerciseQuestion: (
    questionId: number, 
    data: EnglishOrderingExerciseRequest
  ): Promise<AxiosResponse<EnglishOrderingExerciseResponse>> => {
    return apiService.put(`${BASE_URL}/update/ordering-exercise/${questionId}`, data);
  },

  deleteOrderingExerciseQuestion: (
    questionId: number
  ): Promise<AxiosResponse<DeleteResponse>> => {
    return apiService.delete(`${BASE_URL}/delete/ordering-exercise/${questionId}`);
  },  

};

export default exerciseService;