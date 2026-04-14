// TODO: Replace this with your actual Render backend URL after deploying to Render.
// Example: const API_BASE_URL = 'https://your-render-app.onrender.com';
const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const stateSelect = document.getElementById('state');
    const districtSelect = document.getElementById('district');
    const citySelect = document.getElementById('city');

    // Fetch states on load
    fetch(`${API_BASE_URL}/api/states`)
        .then(res => res.json())
        .then(states => {
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateSelect.appendChild(option);
            });
        });

    // Handle state change
    stateSelect.addEventListener('change', () => {
        const state = stateSelect.value;
        districtSelect.innerHTML = '<option value="" disabled selected>Select District / जिला चुनें</option>';
        citySelect.innerHTML = '<option value="" disabled selected>Select City / शहर चुनें</option>';
        districtSelect.disabled = true;
        citySelect.disabled = true;

        if (state) {
            fetch(`${API_BASE_URL}/api/districts?state=${encodeURIComponent(state)}`)
                .then(res => res.json())
                .then(districts => {
                    districts.forEach(district => {
                        const option = document.createElement('option');
                        option.value = district;
                        option.textContent = district;
                        districtSelect.appendChild(option);
                    });
                    districtSelect.disabled = false;
                });
        }
    });

    // Handle district change
    districtSelect.addEventListener('change', () => {
        const state = stateSelect.value;
        const district = districtSelect.value;
        citySelect.innerHTML = '<option value="" disabled selected>Select City / शहर चुनें</option>';
        citySelect.disabled = true;

        if (state && district) {
            fetch(`${API_BASE_URL}/api/cities?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`)
                .then(res => res.json())
                .then(cities => {
                    cities.forEach(city => {
                        const option = document.createElement('option');
                        option.value = city;
                        option.textContent = city;
                        citySelect.appendChild(option);
                    });
                    citySelect.disabled = false;
                });
        }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting... / जमा किया जा रहा है...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Sending Registration Data:', data);

        fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                // Hide form and show success message
                form.classList.add('hidden');
                document.getElementById('success-container').classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        })
        .catch(err => {
            console.error('Registration Error:', err);
            alert(`Error: ${err.message}\nकृपया बाद में प्रयास करें।`);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register Member / सदस्य पंजीकृत करें';
        });
    });
});
