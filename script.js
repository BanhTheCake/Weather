const app = (() => {
    const API_ID = '6c4b444e913e86da3b76c2a2667eb0bf';
    const defautValue = '--';
    const localStorageKey = 'BanhTheCake';
    const input = document.querySelector('#main-input--search_box');
    const cityName = document.querySelector('.main-info--city_name');
    const weatherState = document.querySelector('.main-info--weather_state');
    const weatherImg = document.querySelector('.main-info--weather_img');
    const weatherTemperature = document.querySelector('.main-info--weather_temperature');
    const sunrise = document.querySelector('.sunrise');
    const sunset = document.querySelector('.sunset');
    const humidity = document.querySelector('.humidity');
    const wind = document.querySelector('.wind');
    const btnRecording = document.querySelector('.main-input--voice');
    const container = document.querySelector('.container');
    
    return {
        isRecording: false,
        Start() {
            const data = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
            if (Object.keys(data).length !== 0 && data.constructor === Object) {
                cityName.innerText = data.cityName || defautValue;
                weatherState.innerText = data.weatherState || defautValue;
                weatherImg.setAttribute('src', `${data.weatherImg}`)
                weatherTemperature.innerText = data.weatherTemperature || defautValue;
                sunrise.innerText = data.sunrise || defautValue;
                sunset.innerText = data.sunset || defautValue;
                humidity.innerText = data.humidity || defautValue;
                wind.innerText = data.wind|| defautValue
            }
            else {
                cityName.innerText = defautValue;
                weatherState.innerText = defautValue;
                weatherImg.setAttribute('src', `http://openweathermap.org/img/wn/10n@2x.png`)
                weatherTemperature.innerText = defautValue;
                sunrise.innerText = defautValue;
                sunset.innerText = defautValue;
                humidity.innerText = defautValue;
                wind.innerText = defautValue
            }
        },
        voice() {
            const handleTextByVoice = (text) => {
                const data = text.toLowerCase();
                if (data.includes('thời tiết')) {
                    const weather = data.includes('tại') ? data.split('tại') : data.split('ở');
                    input.value = weather[1].trim();
                    const change = new Event('change');
                    input.dispatchEvent(change);
                }

                if (data.includes('thay đổi màu nền')) {
                    const backgroundColor = text.split('màu nền')[1];
                    container.style.background = backgroundColor;
                }

                if (data.includes('màu nền mặc định')) {
                    container.style.background = '';
                }
                if (data.includes('mấy giờ rồi')) {
                    let utterance = new SpeechSynthesisUtterance(`${moment().hour()}:${moment().minute() < 10 ? `0${moment().minute()}` : moment().minute()}`);
                    speechSynthesis.speak(utterance);
                }
            }


            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'vi-VI';

            btnRecording.onclick = (e) => {
                this.isRecording = !this.isRecording;
                btnRecording.classList.toggle('recording', this.isRecording);
                if (this.isRecording) {
                    recognition.start();
                    console.log('Ready to receive a color command.');
                }
                if (!this.isRecording) {
                    recognition.stop();
                    console.log('stop');
                }
            }

            recognition.onspeechend = (e) => {
                recognition.stop()
                this.isRecording = false;
                btnRecording.classList.remove('recording');
            }

            recognition.onresult = (e) => {
                const data = e.results[0][0].transcript;
                handleTextByVoice(data);
            }

            recognition.onerror = (err) => {
                console.err(err);
            }



        },
        handle() {
            input.addEventListener('change', (e) => {
                fetch(`https://api.openweathermap.org/data/2.5/weather?q=${e.target.value}&APPID=${API_ID}&lang=vi&units=metric`)
                    .then(async (res) => {
                        const data = await res.json();
                        cityName.innerText = data.name || defautValue;
                        weatherState.innerText = data.weather[0].description || defautValue;
                        weatherImg.setAttribute('src', `http://openweathermap.org/img/wn/${data.weather[0].icon || '10n'}@2x.png`)
                        weatherTemperature.innerText = Math.round(data.main.temp) || defautValue;
                        sunrise.innerText = moment.unix(data.sys.sunrise).format("HH:mm") || defautValue;
                        sunset.innerText = moment.unix(data.sys.sunset).format("HH:mm") || defautValue;
                        humidity.innerText = data.main.humidity || defautValue;
                        wind.innerText = (data.wind.speed * 3.6).toFixed(2) || defautValue

                        localStorage.setItem(localStorageKey, JSON.stringify({cityName: cityName.innerText, weatherState: weatherState.innerText, weatherImg: `http://openweathermap.org/img/wn/${data.weather[0].icon || '10n'}@2x.png`, weatherTemperature: weatherTemperature.innerText, sunrise: sunrise.innerText, sunset: sunset.innerText, humidity: humidity.innerText, wind: wind.innerText}))
                    })
                    .catch(err => {
                        cityName.innerText = 'Không tìm thấy :(';
                        weatherState.innerText = defautValue;
                        weatherImg.setAttribute('src', `http://openweathermap.org/img/wn/10n@2x.png`)
                        weatherTemperature.innerText = defautValue;
                        sunrise.innerText = defautValue;
                        sunset.innerText = defautValue;
                        humidity.innerText = defautValue;
                        wind.innerText = defautValue
                        console.log(err);
                    })
            })
        },
        render() {
            this.Start();
            this.handle();
            this.voice();
        }
    }
})();

app.render();