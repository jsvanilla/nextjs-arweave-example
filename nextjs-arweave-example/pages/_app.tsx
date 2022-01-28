import '../styles/globals.css'
import React, { useState, useEffect, useMemo } from 'react'
import { ArjsProvider, useArjs } from 'arjs-react'

function _App() {
  const  wallet  = useArjs();
  const permission = { permissions: ["SIGN_TRANSACTION"] }
  const [textData, setKey] = useState('')

const activate = (connector:any, key:any) => wallet.connect(connector, key)
const getTextData = (e:any) => { console.log(textData); setKey(e.target.value);}

const postData = async () => {
  let key = await wallet.getArweave().wallets.generate();
  
  // PASO 1 Almacenar la transaccion en una variable 
  let transaction1 = await wallet.transaction({
    data: textData
  }, key) 

  // PASO 2 Firmar la transacción (una vez firmada no debe modificarse, de lo contrario no podrá subirse a la permaweb)
  await wallet.sign(transaction1)

  // PASO 3 SUBE LA DATA A LA PERMAWEB
  wallet.submit(transaction1).then((response:any)=>console.log(response))

}

const [balance, setBalance] = useState("Requesting...");
const [address, setAddress] = useState("Requesting...");

wallet.ready(() => {
  if(wallet.status == "connected")(async () => {
    console.log(wallet.getArweave())
    setBalance(wallet.getArweave().ar.winstonToAr( await wallet.getBalance("self")))
    setAddress(await wallet.getAddress())
  })()
})

return(
<div className="m-48">
  <div className="flex flex-col">
    {
      wallet.status == "connected" ?
        (
          <div className="text-center">
            <div className="my-8">Dirección de la billetera: <strong>{address}</strong></div>
            <div className="my-8"> Balance: <strong>{balance}AR</strong></div>
            <button className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded mb-24" onClick={() => wallet.disconnect()}>Desconectar mi Arweave wallet</button>
          </div>
        )  
      :
        (
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-24" onClick={() => activate('arconnect', permission)}>Conecta tu wallet de Arconnect para subir datos</button>
        )   
    } 
      <input className="py-24 shadow appearance-none border rounded w-full px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" value={textData} placeholder={'Mensaje de texto a guardar'} onChange={getTextData}/>
      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-24" onClick={() => postData()}>Subir data a la permaweb</button>
  </div>
</div>
)}

//wrap the root component with 
function App(){
  return (

    <ArjsProvider 
        //Wallets de arweave permitidos
        connectors={{
            arconnect: true,
            arweave: true
        }} 
        //habilitar/deshabilitar la interacción del contrato de smartweave aquí
        enableSWC={true}> 
      <_App />
    </ArjsProvider>
)}

export default App 