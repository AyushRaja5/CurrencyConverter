import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [currencies, setCurrencies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get('https://api.frankfurter.dev/v1/currencies');
        setCurrencies(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch currency list.');
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  const convertCurrency = async () => {
    if (!amount.trim()) {
      setExchangeRate(null);
      return;
    }
    if (fromCurrency === toCurrency) {
      Alert.alert('Invalid Selection', 'Please change either the source or target currency.');
      return;
    }
    const numericAmount = parseFloat(amount); // Convert amount to a number
    if (isNaN(numericAmount)) {
      Alert.alert('Invalid Input', 'Please enter a valid number.');
      return;
    }
    try {
      const response = await axios.get(`https://api.frankfurter.dev/v1/latest?from=${fromCurrency}&to=${toCurrency}`);
      console.log("Ayush Raja : ", response.data); // Debugging line
      const rate = response.data.rates[toCurrency];
      const result = numericAmount * rate;
      setExchangeRate(Number(result.toFixed(2))); // Ensure the result is a number
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch exchange rates.');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={styles.label}>Enter Amount:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
          />
          <Text style={styles.label}>From:</Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={setFromCurrency}
              items={Object.keys(currencies).map((currency) => ({ label: `${currency} - ${currencies[currency]}`, value: currency }))}
              value={fromCurrency}
            />
          </View>
          <Text style={styles.label}>To:</Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={setToCurrency}
              items={Object.keys(currencies).map((currency) => ({ label: `${currency} - ${currencies[currency]}`, value: currency }))}
              value={toCurrency}
            />
          </View>
          <View style={{ marginTop: 20 }}>
            <Button title="Convert" onPress={convertCurrency} />
          </View>

          {exchangeRate !== null && amount.trim() !== '' && (
            <Text style={styles.result}>
              {amount} {fromCurrency} = {exchangeRate} {toCurrency}
            </Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#000', paddingHorizontal: 10, marginVertical: 10, borderRadius: 5 },
  result: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
});

export default CurrencyConverter;
