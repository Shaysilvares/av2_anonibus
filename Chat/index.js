import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet, View, Text, Image, ScrollView,
  TextInput, TouchableOpacity, Button, ImageBackground
} from 'react-native';
import firebase from '../config/firebase';
import api from '../services/axios';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export default function Chat() {

  const [user, setUser] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [caixaTexto, setCaixaTexto] = useState('')
  const [scrollview, setScrollview] = useState('')
  const [imagembackground, setImagembackground] = useState(null)

  const db = firebase.firestore()

  const salvar = async () => {
  
  let novaCaixaTexto = '';

    novaCaixaTexto = await filtrarPalavroes(caixaTexto);
    console.log(novaCaixaTexto);
   
    api.post('/enviarMensagem', {
      mensagem: novaCaixaTexto,
      usuario: user.name,
      avatar: user.picture,
    }).then(function () {
        setCaixaTexto('')
        scrollview.scrollToEnd({ animated: true })
      }).catch(function () {

      }) 
  }

  async function getPalavroes() {
    let palavroes = [];

    try {
      await api.get('/getPalavroes').then(response => {
        palavroes = response.data.palavroes.itens;
      });
    } catch(err) {
      console.log(`Erro ao buscar ${err}`)
    }

    return palavroes;
  }
  
   const filtrarPalavroes = async (caixaTexto) => {
    let mensagens = [];
    mensagens = caixaTexto.split(' ');

    let palavroes = [];
    let hasPalavrao = {};
    let palavraSensurada = '';
    let posicao;
    let novaMensagem = '';

     palavroes = await getPalavroes();

     hasPalavrao = mensagens.map(item => {
      return {'item': item, 'temPalavrao': palavroes.includes(item), 'position': mensagens.indexOf(item) }  
    })
    
    hasPalavrao.forEach(element => {
      if(element.temPalavrao == true) {
        palavraSensurada = element.item.replace(/./g, '\u200D\u2764\uFE0F\u200D');
        posicao = element.position;
        mensagens[posicao] = palavraSensurada
        novaMensagem = mensagens.join(' ');
      }
    });
    
    return novaMensagem; 
   }

  const userr = firebase.auth().currentUser;

  firebase.auth().onAuthStateChanged(userr => {
    if (userr){
          firebase.storage().ref('users/' + userr.email  + '/profile.jpg').getDownloadURL().then(function (downloadURL) {
          setImagembackground(downloadURL)
        },function(error){
          console.log(error.code)
        });
    }
  });
  

  uploadImagemBackground = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    var ref = firebase.storage().ref('users/' + userr.email  + '/profile.jpg') ;

    ref.put(blob).then(function (snapshot) {

      snapshot.ref.getDownloadURL().then(function (downloadURL) {
        setImagembackground(downloadURL)
      })

    })
  }

  escolherbackground = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.cancelled) {
        // setImagem(result.uri)
        uploadImagemBackground(result.uri);

      }

      console.log(result);
    } catch (E) {
      console.log(E);
    }
  };


  useEffect(() => {
    carregaUsuarioAnonimo()
    let mensagens_enviadas = []
    const unsubscribe = db.collection("chats")
      .doc("sala_01").collection('mensagens')
      .onSnapshot({ includeMetadataChanges: false }, function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === "added") {
            const { mensagem, usuario, avatar } = change.doc.data()
            const id = change.doc.id
            mensagens_enviadas.push({ mensagem, usuario, avatar, id })
          }
        })
        setMensagens([...mensagens_enviadas])
        scrollview ? scrollview.scrollToEnd({ animated: true }) : null;
      })
    return () => {
      unsubscribe()
    }
  }, [])

  const carregaUsuarioAnonimo = () => {
    axios.get('https://randomuser.me/api/')
      .then(function (response) {
        const user = response.data.results[0];
        // setDistance(response.data.distance)
        setUser({
          name: `${user.name.first} ${user.name.last}`,
          picture: user.picture.large
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <View style={styles.view}>

{imagembackground &&
         <ImageBackground source={{ uri: imagembackground }} style={{opacity: 0.6, height: 670, width: 400, position: 'absolute', resizeMode: 'cover'}} />
      }
    
    <Button title="Escolher papel de parede" onPress={() => { escolherbackground() }} />

      {user &&
        <>
          <TouchableOpacity onPress={carregaUsuarioAnonimo}>

            <Image
              style={styles.avatar}
              source={{ uri: user.picture }} />
          </TouchableOpacity>

          <Text style={styles.nome_usuario}>{user.name}</Text>
        </>

      }



      <ScrollView style={styles.scrollview} ref={(view) => { setScrollview(view) }}>
        {
          mensagens.length > 0 && mensagens.map(item => (

            <View key={item.id} style={styles.linha_conversa}>
              <Image style={styles.avatar_conversa} source={{ uri: item.avatar }} />
              <View style={{ flexDirection: 'column', marginTop: 5 }}>
                <Text style={{ fontSize: 12, color: '#999' }}>{item.usuario}</Text>
                {typeof (item.mensagem) == "string" ?
                  <Text>{item.mensagem}</Text>
                  :
                  <Text> </Text>
                }

              </View>

            </View>




          ))
        }
      </ScrollView>


      <View style={styles.footer}>
        <TextInput
          style={styles.input_mensagem}
          onChangeText={text => setCaixaTexto(text)}
          value={caixaTexto} />

        <TouchableOpacity onPress={salvar}>
          <Ionicons style={{ margin: 3 }} name="md-send" size={32} color={'#999'} />
        </TouchableOpacity>
      </View>



    </View>)
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    width: '100%',
    paddingTop: 50,
    borderBottomWidth: 1,
    borderColor: '#000'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#333'
  },

  avatar_conversa: {
    width: 40,
    height: 40,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10
  },

  nome_usuario: {
    fontSize: 25,
    color: '#999'
  },

  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 50
  },
  input_mensagem: {
    borderColor: '#e6e6e6',
    borderWidth: 1,
    flex: 1,
    borderRadius: 4,
    margin: 10,
    marginTop: 0,
    padding: 4
  },
  scrollView: {
    backgroundColor: '#fff',
    width: '100%',
    borderTopColor: '#e6e6e6',
    borderTopWidth: 1,
  },
  linha_conversa: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 10,
    marginRight: 60,
  }
})
