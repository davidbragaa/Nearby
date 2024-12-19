import { View, Alert, Modal, StatusBar, ScrollView } from "react-native"
import { router, useLocalSearchParams, Redirect } from "expo-router"
import {api} from "@/services/api"
import { useEffect, useState,  useRef } from "react"

import { Loading } from "@/components/loading"
import { useCameraPermissions, CameraView } from "expo-camera"
import { Button } from "@/components/button"
import { Cover } from "@/components/market/cover"
import { Coupon } from "@/components/market/coupon"
import {Details, PropsDetails } from "../../components/market/details"

type DataProps = PropsDetails & {
    cover: string
}
 
export default function Market() {
    const [data, setData] = useState<DataProps>()    
    const [coupon, setCoupon] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [couponIsFetching, setCouponIsFetching] = useState(false)
    const [isVisibleCameraModal, setIsVisibleCameraModal] = useState(false)

    const [_, requestPermission] = useCameraPermissions()

    const params = useLocalSearchParams<{ id: string }>()

    const qrLock = useRef(false)
    
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

    async function handleOpenCamera() {
        try {
            const { granted } = await requestPermission()
            
            if (granted) {
                return Alert.alert("Camera", "Voce precisa habilitar o uso da camera.")
            }

            qrLock.current = false
           setIsVisibleCameraModal(true) 
        } catch (error) {
            console.log(error)
            Alert.alert("Camera", "Nao foi possível utilizar a camera")
        }
    }

    async function getCoupon(id: string) {
        try {
            setCouponIsFetching(true) 
            
            const { data } = await api.patch("/coupons/" + id)

            Alert.alert("Cupom", data.coupon)
            setCoupon(data.coupon)

        } catch (error) {
            console.log(error)
            Alert.alert("Erro", "Nao foi possível utilizar o coupon")
        } finally {
            setCouponIsFetching(false)
        }
    }

    function handleUseCoupon(id: string) {
        setIsVisibleCameraModal(false)

        Alert.alert("Cupom",
            "Nao e possível utilizar um cupom resgatado. Deseja realmente resgatar o cupom?",
            [
                { style: "cancel", text: "Nao" },
                {text: "Sim", onPress:() => getCoupon(id) },
            ]
        )
    }

    useEffect(() => {
        fetchMarket()
    }, [params.id, coupon])
    
    if (isLoading) {
        return <Loading />
    }

    if (!data) {
        return <Redirect href={"/home"}/>
    }

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" hidden={isVisibleCameraModal} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <Cover uri={data.cover} />
                <Details data={data} />
                {coupon && <Coupon code={coupon} />}
            </ScrollView>
            
            <View style={{ padding: 32 }}>
                <Button onPress={handleOpenCamera}>
                    <Button.Title>Ler QR Code</Button.Title>
                </Button>
            </View>

            <Modal style={{ flex: 1 }} visible={isVisibleCameraModal}>
                <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    onBarcodeScanned={({ data }) => {
                        if(data && !qrLock.current){
                            setTimeout(() => handleUseCoupon(data), 500)
                        }
                    }}
                />
                <View style={{position: "absolute", bottom:32, left:32, right:32}}>
                    <Button onPress={() => setIsVisibleCameraModal(false)} isLoading={couponIsFetching}>
                    <Button.Title>Voltar</Button.Title>
                    </Button>
                </View>
            </Modal>
        </View>
        )
}