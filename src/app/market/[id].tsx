import { View, Alert } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import {api} from "@/services/api"
import { useEffect, useState } from "react"

import { Loading } from "@/components/loading"
import {Cover} from "@/components/market/cover"
 
export default function Market() {
    const [data, setData] = useState()    
    const [isLoading, setIsLoading] = useState(true)

    const params = useLocalSearchParams<{ id: string }>()
    
    async function fetchMarket() {
        try {
            const { data } = await api.get(`/markets/${params.id}`) 
            setData(data)
            setIsLoading(false)
        } catch (error) {
            console.log(error)
            Alert.alert("Erro", "Não foi possível carregar os dados",
                [{ text: "Ok", onPress: () => router.back() },])
        }
    }

    useEffect(() => {
        fetchMarket()
    }, [params.id])
    
    if (isLoading) {
        return <Loading />
    }

    return (
        <View style={{ flex: 1 }}>
            <Cover uri={data.cover} />
            </View>
        )
}