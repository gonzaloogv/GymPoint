import React, { useState } from "react";
import validator from 'validator';
import type { ChangeEventTarget, FormErrors, SubmissionStatus } from "../types/contact.types";

export const useContactForm = () => {
    const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

    const [formData, setFormData] = React.useState({
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState<FormErrors>({ email: ''});
    const [result, setResult] = React.useState<SubmissionStatus>(null);

    const handleChange = (e: React.ChangeEvent<ChangeEventTarget>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'email') {
            if (!validator.isEmail(formData.email)) {
                setErrors( {...errors, email: 'Email not valid'});
            } else {
                setErrors({ ...errors, email: ''})
            }
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        setResult("sending");
        const formData = new FormData(event.target);

        formData.append("access_key", ACCESS_KEY);

        const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
        });

        const data = await response.json();

        if (data.success) {
        setResult("success");
        event.target.reset();
        } else {
        console.log("Error", data.message);
        setResult("error");
        }
    };

    return {
        result,
        handleSubmit,
        formData,
        handleChange,
        errors
    };
};