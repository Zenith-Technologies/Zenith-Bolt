import {APIResponse} from "../types/ResponseTypes";

export function wrap<T extends Array<any>>(fn: (...args: T) => APIResponse) {
    return (...args: T):  APIResponse => {
        try{
            return fn(...args);
        }catch(err){
            if(err instanceof Error){
                return {
                    success: false,
                    error: {
                        message: err.message,
                        stack: err.stack ?? "No stack available"
                    },
                    data: null
                }
            }else{
                return {
                    success: false,
                    error: {
                        message: "Unknown issue",
                        stack: "Unknown stack"
                    },
                    data: null
                }
            }
        }
    }
}