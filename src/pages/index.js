import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  const contractAddress = "0x1290Fda2262ef138e5e1D3096639a19C09A15206";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Garanta que possua a Metamask instalada!");
        return;
      } else {
        console.log("Temos o objeto ethereum", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Encontrada a conta autorizada:", account);
        setCurrentAccount(account);
      } else {
        console.log("Nenhuma conta autorizada foi encontrada");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implemente aqui o seu método connectWallet
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("MetaMask encontrada!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Conectado", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Recuperado o número de tchauzinhos...", count.toNumber());
        const waveTxn = await wavePortalContract.wave();
        console.log("Minerando...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Minerado -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Total de tchauzinhos recuperado...", count.toNumber());
      } else {
        console.log("Objeto Ethereum não encontrado!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ width: 900, margin: "0 auto", textAlign: "center" }}>
      <h1>🎶 Olá Pessoal!</h1>

      <p>
        Me chamo Rafael Palau, sou desenvolvedor Front end React e adoro ouvir
        músicas enquanto estou trabalhando.
      </p>
      <p>
        Gostaria que você me enviasse uma música para eu colocar na minha{" "}
        <strong>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://music.youtube.com/playlist?list=PLo2-61FIAU2pRPUPAGoT5nG6wCi1EsJPt&feature=share"
          >
            Friends Playlist
          </a>
        </strong>
      </p>

      <button
        style={{
          background: "red",
          border: "none",
          padding: 15,
          borderRadius: 4,
          color: 'white',
          fontSize: 18, 
          cursor: "pointer"
        }}
        onClick={wave}
      >
        Enviar uma música
      </button>
      {!currentAccount && (
        <button onClick={connectWallet}>Conectar carteira</button>
      )}
    </div>
  );
}
