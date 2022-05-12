import react, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Dimensions, Alert, Vibration, TouchableOpacity, Modal, Button, StatusBar, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { RNCamera } from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function App() {

  const [scanned, setScanned] = useState(false);
  const [modalLidos, setModalLidos] = useState(false);
  const [rnFlashMode, setRnFlashMode] = useState(RNCamera.Constants.FlashMode.off);
  const [newCod, setNewCod] = useState(null);
  const [zoom, setZoom] = useState(0.1);

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const barmaskWidth  = 300;
  const barmaskHeight  = 100;
  const viewMinX = (width - barmaskWidth)/2;
  const viewMinY = (height - barmaskHeight)/2;
  const [codigos , setCodigos] = useState([]);  
  const quantidade = 10;
  
  var Sound = require('react-native-sound');
  Sound.setCategory('Alarm');

  var ding = new Sound(require("./android/app/src/main/res/raw/ding.mp3"), Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());
  });

  function playBeep() {
    ding.setVolume(0.1)
    ding.play();
  }
  
  const list = codigos.map(
    (codebar, index) =>
      <View
        key={index}
        style={styles.containerInpuCodebar}
      >
        <TextInput
          style={styles.inputCodebar}
        >
          {codebar}
        </TextInput>
        <View style={{flexDirection: "row"}}>
          <TouchableOpacity onPress={() => removeCodebar(codebar, index)}>
            <MaterialIcons
              name="delete-forever"
              size={25}
              color="#f64c75"
            />
          </TouchableOpacity>
        </View>
      </View>
  );

  function salvarCodigos(codigo) {
    if(codigos.length >= quantidade) {
      Alert.alert("Atenção", "Quantidade de produtos lidos acima do solicitado!");
      return;
    }
    setCodigos([...codigos, codigo]);
  }
  
  function salvarCodigosManual() {
    if(newCod) {
      setCodigos([...codigos, newCod]);
      setNewCod(null);
    }
  }

  function removeCodebar(codebar) {
    setCodigos(codigos.filter(codigo => codigo !== codebar));
  }
  
  async function handleBarCodeScanned(codebar) {
    let barras = codebar[0];
    if(barras !== undefined) {
      let codigo = String(barras.data);
      let x = Number(barras.bounds.origin.x);
      let y = Number(barras.bounds.origin.y);

      if((x > viewMinX && y > viewMinY )&&( x < (viewMinX + 60) && (y < viewMinY + 60))) {
        let regex = /^(?=.*[@!#$%^&*()/\\])[@!#$%^&*()/\\a-zA-Z0-9]/;
        if(!regex.test(codigo)) {
          playBeep();
          setScanned(true);
          Vibration.vibrate();
          salvarCodigos(codigo); 

          setTimeout(() => {
            setScanned(false)
          }, 500);
        }
      }
    }
  }
  
  function openModal() {
    setModalLidos(true);
    setScanned(true);
  }

  function closeModal() {
    setModalLidos(false);
    setScanned(false);
  }

  function changeZoom(change) {
    if(change === 'positive') {
      if(zoom >= 1) return;
      setZoom(zoom + 0.1)
    }else {
      if(zoom <= 0.1) return;
      setZoom(zoom - 0.1)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        animated={true}
        backgroundColor="#000"
      />
      <RNCamera
        style={styles.preview}
        zoom={zoom}
        type={RNCamera.Constants.Type.back}
        flashMode={rnFlashMode}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        androidRecordAudioPermissionOptions={{
          title: 'Permission to use audio recording',
          message: 'We need your permission to use your audio',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        onGoogleVisionBarcodesDetected={scanned ? undefined : ({ barcodes }) => {handleBarCodeScanned(barcodes)}}
      >
        <BarcodeMask height={barmaskHeight} showAnimatedLine={false} width={barmaskWidth} />

        <View style={{position: 'absolute', top: "5%" }}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity title='teste' style={{ width: 120, height: 50, marginHorizontal: 30}} onPress={() => setRnFlashMode(rnFlashMode === RNCamera.Constants.FlashMode.off ?  RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off)}>
              <Icon style={{justifyContent: 'center', alignSelf: 'center', marginTop: 7}} name="flashlight-outline" size={40} color="white" />
              <Text style={{justifyContent: 'center', alignSelf: 'center', color: 'white'}}>On/Off</Text>
            </TouchableOpacity>
                        
            <TouchableOpacity title='teste' style={{ width: 120, height: 50, marginHorizontal: 30 }} onPress={openModal}>
              <Icon style={{justifyContent: 'center', alignSelf: 'center', marginTop: 7}} name="barcode-outline" size={40} color="white" />
              <Text style={{justifyContent: 'center', alignSelf: 'center', color: 'white'}}>{codigos.length}/{quantidade}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{position: 'absolute', bottom: "30%"}}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity title='teste' style={{ width: 120, height: 50, marginHorizontal: 30}} onPress={() => changeZoom('positive')}>
              <MaterialIcons style={{justifyContent: 'center', alignSelf: 'center', marginTop: 7}} name="zoom-in" size={40} color="white" />
              <Text style={{justifyContent: 'center', alignSelf: 'center', color: 'white'}}>Zoom In</Text>
            </TouchableOpacity>
                        
            <TouchableOpacity title='teste' style={{ width: 120, height: 50, marginHorizontal: 30 }} onPress={() => changeZoom('negative')}>
              <MaterialIcons style={{justifyContent: 'center', alignSelf: 'center', marginTop: 7}} name="zoom-out" size={40} color="white" />
              <Text style={{justifyContent: 'center', alignSelf: 'center', color: 'white'}}>Zoom Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        { codigos.length >= quantidade &&
          <View style={{position: 'absolute', bottom: 15, right: 15 }}>
            <TouchableOpacity style={{backgroundColor: '#2E8B57', width: 60, height: 50, borderRadius: 20 }}>
              <Icon style={{justifyContent: 'center', alignSelf: 'center' }} name="checkmark-outline" size={40} color="white" />
            </TouchableOpacity>
          </View>
        }

        <Modal visible={modalLidos} >
          <ScrollView style={{marginTop: '4%'}}>
            {list}
          </ScrollView>
          <View style={{alignSelf: 'center', position: 'absolute', bottom: 10, width: '95%'}}>
            <View style={styles.digitarCodebar}>
              <TextInput
                style={styles.digitarCodebarInput}
                placeholderTextColor="#999"
                autoCorrect={false}
                placeholder="Digite o Código de Barras"
                maxLength={128}
                onChangeText={text => setNewCod(text) }
                value={newCod}
                keyboardType='numeric'
              />
              <TouchableOpacity
                style={styles.confirmaDigitarCodebar}
                onPress={() => salvarCodigosManual()}
              >
                <Ionicons name="checkmark" size={25} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Button title='Voltar' color={'#1cadce'} onPress={closeModal} />
          </View>
        </Modal>
        
      </RNCamera>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  containerInpuCodebar: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 4,
    backgroundColor: "#eee",
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: 'center',
    marginHorizontal: 10
  },
  inputCodebar: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center"
  },
  digitarCodebar: {
    padding: 0,
    height: 60,
    justifyContent: 'center',
    marginBottom: -15 ,
    alignSelf: 'stretch',
    flexDirection: "row",
    borderColor: "#eee",
    backgroundColor: 'white'
  },
  digitarCodebarInput: {
    flex: 1,
    height: 35,
    backgroundColor: "#eee",
    borderRadius: 4,
    padding: 5,
    borderWidth: 1,
    borderColor:"#eee"
  },
  confirmaDigitarCodebar: {
    height: 35,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1cadce',
    borderRadius: 4,
    marginLeft: 10
  }
});