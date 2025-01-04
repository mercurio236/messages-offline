import { useEffect, useState } from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import dgram from 'react-native-udp'
import { NetworkInfo } from 'react-native-network-info'

export default function Index() {
  const [ipAddress, setIpAddress] = useState<string | null>('')
  const [isServer, setIsServer] = useState(false)
  const [message, setMessage] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('')
  const [socket, setSocket] = useState<any>('')
  const [ipServer, setIpServer] = useState('IP Server')

  useEffect(() => {
    const fetchIpAddress = async () => {
      const ip = await NetworkInfo.getIPV4Address()
      setIpAddress(ip)
    }

    fetchIpAddress()
    if (isServer) {
      const server = dgram.createSocket({ type: 'udp4' })

      server.on('message', (data, rinfo) => {
        setMessage(data.toString())
        server.send(
          'Resposta do servidor',
          undefined,
          undefined,
          rinfo?.port,
          rinfo?.address,
          (error) => {
            if (error) {
              console.log('Erro', error)
            } else {
              console.log('Mensagem enviado com sucesso.')
            }
          }
        )
        console.log('Mensagem recebida', data.toString())
      })

      server.on('listening', () => {
        setConnectionStatus(`Celular por perto ${server.address().port}`)
      })

      server.bind(8888)
      setSocket(server)
    } else {
      setConnectionStatus(`Servidor desconectado`)
      const client = dgram.createSocket({ type: 'udp4', debug: true })
      client.bind(8887)
      setSocket(client)
    }

    return () => {
      socket && socket.close()
    }
  }, [isServer])

  const sendMessage = () => {
    if (isServer) return

    const client = socket

    client.send(
      'Olá client',
      undefined,
      undefined,
      8888,
      ipServer,
      (error: any) => {
        if (error) {
          console.log('Error ao enviar mensagem', error)
        } else {
          console.log('Mensagem enviada com sucesso')
        }
      }
    )
    client.on('message', async (message: string, remoteInfo: any) => {
      setMessage(message.toString())
    })
  }
  return (
    <View>
      <Text>{connectionStatus}</Text>
      <Button
        title={isServer ? 'Desligar servidor' : 'Ligar servidor'}
        onPress={() => setIsServer(!isServer)}
      />
      <Button
        title="Enviar mensagem"
        onPress={sendMessage}
        disabled={isServer}
      />
      <TextInput onChangeText={setIpServer} value={ipServer} />
      <Text>Enviar para o IP: {ipAddress}</Text>
      <Text>Mensagem recebida: {message}</Text>
    </View>
  )
}
