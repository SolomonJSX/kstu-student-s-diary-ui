import {BASE_URL} from "../constants/hosts";
import axios from 'axios';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
})