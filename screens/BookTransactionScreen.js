import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image,KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        scannedData: '',
        buttonState: 'normal',
        transactionMessage: ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false  
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState===" BookId"){
        this.setState({
            scanned:true,
            scannedBoodId:data,
            buttonState: 'normal'
        });
      }

      else if(buttonState=== "StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        })
      }
    }


      initiateBookIssue = async()=>{
        db.collection("transaction").add({
          'studentId': this.state.scannedStudentId,
          'bookId': this.state.scannedBoodId,
          'data': firebase.firestone.timestamp.now().toDate(),
          'transactionType': "Return"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
          'bookAvailability':true
        })

        db.collection("students").doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued': firebase.firestone.feildValue.increment(-1)
        })

        this.setState({
          scannedBookId:'',
          scannedStudentId:''
        })

      }

      initiateBookReturn = async()=> {
        db.collection("transactions").add({
          studentId:this.state.scannedStundentId,
          bookId: this.state.scannedBookId,
          date: firebase.firestore.Timestamp.now().toDate(),
          transactionType: "Return"

        });
    db .collection("books")
    .doc(thos.state.scannedBookId)
    .update({
      bookAvailability: true
    });

    db.coleection("students")
    .doc(this.state.scannedStudentId)
    .update({
      numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
    });

    this.setState({
      scannedStudentId: "",
      scannedBoodId:""
    });

      };

      checkBookEligibility= async() => {
        const bookRef = await db
        .collection("books")
        .where("bookId", "==", this.state.scannedBoodId)
        .get();

        var transactionType = "";
        if(bookRef.docs.length == 0){
          transactionType = "false";
        }else{
          bookRef.docs.map(doc => { 
            var book = doc.data();
            if(book.bookAvailability){
              transactionType= "Issue";
              transactionType = "Return";
            }

          });
        }
        return transactionType;
      }

      checkStudnetEligibilityForBookIssue = async()=> {
        const studentRef =await db
        .collection("students")
        .where("studentId", "==", this.state.scannedStudentId)
        .get();
        var isStudentEligible= "";
        if(studentRef.docd.lenght == 0){
          this.setState({
            scannedStudentId: "",
            scannedBoodId:""
          });
          isStudentEligible = false;
          Alert.alert("The student id doesn't exist in the database");
        } else{
          studentRed.docs,map(doc => {
            var student  = doc.data();
            if(student.numberOfBooksIssued <2){
              isStudentEligible=  true;
            } else{
              isStudentEligible= false;
              Alert.alert("The student has already issued 2 books");
              this.setState({
                scannedStudentId: "",
                scannedBookId: ""
              });
            }
          });
        }
      return isStudentEligible;
      };

      checkStudentEligibiltyForReturn = async()=> {
        const transactionRed = await db
        .collection ("transactions")
        .where("bookId", "==", this.state.scannedBookId)
        .limit(1)
        .get();
        var isStudentEligible = "";
        tranactionRef.docs.map(doc => {
          var lastBookTransaction  = doc.data();
          if(lastBookTransaction.studentId === this.state,scannedStudentId){
            isStudentEligible = true;
          }else {
            isStudentEligible = false;
            Alert.alert("The book wasn't issed by this student!");
            this.setState({
              scannedStundentId: "",
              scannedBookId:""
            });
          }
        });
        return isStudentEligible;
      };


      handleTransaction= async()=>{
        var transactionMessage=null;
        db.collection("books").doc(this.state.scannedBookId).get()
        .then((doc)=>{
          var book = doc.data()
          if(book.bookAvailability){
            this.initiateBookIssue();
            transactionMessage= "book Issued"
            ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
          }
          else{
            this.initiateBookReturn();
            transactionMessage = "Book Returned"
            ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
          }
        })
        this.setState({
          transactionMessage:transactionMessage
        })
      }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView  style={styles.container} behavior="padding" enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text =>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText ={text => this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async()=>{
                var transactionMessage = this.handleTransaction();
                this.setState(
                  {scannedBookId:'',
                   scannedStudentId:''})
              }}>
          <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 20,
      textAlign: 'center',
      marginTop: 10,

    },
    inputBox:{
        width : 200,
        height: 40,
        borderWidth: 1.5,
        borderRightwidth: 0,
        fontSize: 20

    },
    inputView:{
        flexDirection: 'row',
        margin:20,
    },
    scanButton:{
        backgroundColor:'red',
        width: 50,
        borderWidth: 1.5,
        borderLeftWidth: 0,
    },
    submitButton:{
      width:100 ,
      height:50,
      backgroundColor: '#FBC02D'

    },
    submitButtonText:{
    padding:10,
    textAlign: 'center',
    fontSize:20,
    color: 'white',
    fontWeight: 'bold'
    }

  });