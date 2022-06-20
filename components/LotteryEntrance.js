import { useWeb3Contract } from "react-moralis"
import {useMoralis} from "react-moralis"
import {useEffect} from "react"
import {useState} from "react"
import { contractAddresses, abi } from "../constants"
import {ethers} from "ethers"
// import {contractAddresses, abi} from "../constants/index"
import { useNotification } from "web3uikit"

export default function LotteryEntrance(){
    const {chainId: chainIdHex, isWeb3Enabled} = useMoralis()
    
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    


    const [fee, setEntraceFee] = useState("0")
    const [numPlayer, setNumPlayer] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    
    const dispatch = useNotification()

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getEntranceFee",
        
    })

    const {runContractFunction: enterRaffle, isLoading, isFetching} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: fee
    })

    const {runContractFunction: getNumberOfPlayers} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
        
    })
    const {runContractFunction: getRecentWinner} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    
    })
    
    async function updateUI(){
        const entranceFee = await getEntranceFee()
        const numPlayers = await getNumberOfPlayers()
        const recentWinners = await getRecentWinner() 
        console.log(numPlayers);
        console.log(recentWinners);
        setEntraceFee(entranceFee)
        setNumPlayer(numPlayers)
        setRecentWinner(recentWinners)
   }

    useEffect(()=>{
        if(isWeb3Enabled){
            console.log("Reached");
            updateUI()
        }
    },[isWeb3Enabled])
    const handleSuccess = async function (tx){
        await tx.wait(1)
        handleNewNotification()
    }
    
    const handleNewNotification = function(){
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topL",
            icon: "checkmark"
        })
    }

    return (

    <div>
    
    {raffleAddress ? 


     <div>Entrance Fee: {ethers.utils.formatUnits(fee.toString(),"ether")} ETH
     <div>Number of Players: {numPlayer.toString()}</div>
     <div>Recent Winner: {recentWinner.toString()}</div>
        <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
        onClick={async function(){
            await enterRaffle({
                onSucess: handleSuccess,
                onError: (error) => console.log(error)
            }
               
            )}} 
            disabled={isLoading||isFetching}>
        {isLoading || isFetching ? <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>: <div>Enter Raffle</div>}

            </button>
    </div>
    :
    <div>No Raffle Address Found</div>}

    </div>

    )
}