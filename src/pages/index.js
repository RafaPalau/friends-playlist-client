import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [newMusic, setNewMusic] = useState("");
  const contractAddress = "0x4E1cB44b4be8D86529d0d915E1dF743585332b6F";
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map((wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            music: wave.music,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        // TODO - Snackbar "Objeto etheriun não existe"
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, music) => {
      console.log("NewWave", from, timestamp, music);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          music: music,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, [contractABI]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return;
      } else {
        getAllWaves();
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        // TODO - Snackbar "Encontrada a conta autorizada"
        setCurrentAccount(account);
      } else {
        // TODO - Snackbar "Nenhuma conta autorizada foi encontrada"
      }
    } catch (error) {
      console.log(error);
    }
  };

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

      // TODO - snackbar success "Conta Conectada accounts[0]"
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
        const waveTxn = wavePortalContract.wave(newMusic, { gasLimit: 300000 });
        count = await wavePortalContract.getTotalWaves();
      } else {
        // TODO - Snackbar "Objeto etheriun não existe"
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const day = `0${d.getDate()}`.slice(-2);
    const year = d.getFullYear();
    const hours = `0${d.getHours()}`.slice(-2);
    const minutes = `0${d.getMinutes()}`.slice(-2);

    return `${day}/${month}/${year} às ${hours}:${minutes}`;
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 300,
          margin: "0 auto",
        }}
      >
        <input
          style={{
            marginBottom: 10,
            padding: 15,
            borderRadius: 5,
            border: "1px solid #ccc",
          }}
          type="text"
          value={newMusic}
          onChange={(e) => setNewMusic(e.target.value)}
        />

        <button
          style={{
            background: "red",
            border: "none",
            padding: 15,
            borderRadius: 4,
            color: "white",
            fontSize: 18,
            cursor: "pointer",
          }}
          onClick={wave}
        >
          Enviar a música
        </button>
      </div>

      {!currentAccount && (
        <button onClick={connectWallet}>Conectar carteira</button>
      )}

      {allWaves
        .sort((a, b) => {
          return b.timestamp - a.timestamp;
        })
        .map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <h3>Música: {wave.music}</h3>
              <div>Endereço: {wave.address}</div>
              <div>Data/Horário: {formatDate(wave.timestamp.toString())}</div>
            </div>
          );
        })}
    </div>
  );
}
