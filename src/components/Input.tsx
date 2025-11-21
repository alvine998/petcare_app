import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { COLORS } from '../config/color';
import normalize from 'react-native-normalize';

interface InputProps extends TextInputProps {
  label: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  required = false,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.asterisk}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, style]}
        {...props}
        accessibilityLabel={`${label} ${required ? 'required' : ''}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    // marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontWeight: '500',
    fontSize: 16,
    color: COLORS.black,
  },
  asterisk: {
    color: COLORS.danger,
    marginLeft: 2,
  },
  input: {
    paddingVertical: normalize(15),
    paddingHorizontal: normalize(15),
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
});
