import React from 'react'

const ContactForm = () => {
    const web3FormsKey = import.meta.env.VITE_WEB3FORMS_KEY

    const onSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        formData.append("access_key", web3FormsKey);

        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: json
        }).then((res) => res.json());

        if (res.success) {
            console.log("Success", res);
            alert("Message sent successfully!");
            window.location.reload()
        } else {
            alert("Message NOT sent. Please, make sure every field is correctly filled.")
        }
    };

    return (
        <div className='flex justify-start items-center min-h-screen'>
            <form className='border-2 border-[#BBFF9E] bg-[#BBFF9E]/50 p-8' onSubmit={onSubmit}>
                <label className='block text-gray-700 text-sm font-bold mb-2'>Name:</label>
                <input className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' type="text" name="name" required />
                <br />
                <label className='block text-gray-700 text-sm font-bold mb-2'>E-mail:</label>
                <input className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' type="email" name="email" required />
                <br />
                <label className='block text-gray-700 text-sm font-bold mb-2'>Message:</label>
                <textarea className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' rows={10} name="message" required></textarea>
                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full' type="submit">Submit Form</button>
            </form>
        </div>
    );
}

export default ContactForm