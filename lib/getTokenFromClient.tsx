import { authClient } from "./auth-client";

export const getTokenClient=async()=>{
	const {data,error}=await authClient.token()
	const jwtToken=data?.token
	return jwtToken
}