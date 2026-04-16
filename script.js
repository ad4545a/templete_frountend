// Use localhost for local development, Render URL for production
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://templete-backend.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const stateSelect = document.getElementById('state');
    const districtSelect = document.getElementById('district');
    const citySelect = document.getElementById('city');
    const titleSelect = document.getElementById('title');
    const fatherNameLabel = document.getElementById('fatherNameLabel');
    const fatherNameInput = document.getElementById('fatherName');
    const categorySelect = document.getElementById('category');
    const professionGroup = document.getElementById('professionGroup');
    const professionSelect = document.getElementById('profession');
    const firmNameGroup = document.getElementById('firmNameGroup');

    // Title change → swap Father Name / Husband Name label
    titleSelect.addEventListener('change', () => {
        if (titleSelect.value === 'Mrs') {
            fatherNameLabel.textContent = "Husband's Name / पति का नाम";
            fatherNameInput.placeholder = "Enter husband's name / पति का नाम दर्ज करें";
        } else {
            fatherNameLabel.textContent = "Father's Name / पिता का नाम";
            fatherNameInput.placeholder = "Enter father's name / पिता का नाम दर्ज करें";
        }
    });

    // Category change → show/hide Profession & Firm Name
    categorySelect.addEventListener('change', () => {
        const category = categorySelect.value;
        if (category === 'Samaj Member') {
            professionGroup.classList.remove('hidden');
            // Check if Jeweller is selected in profession
            checkProfessionForFirmName();
        } else if (category === 'Jeweller') {
            professionGroup.classList.add('hidden');
            firmNameGroup.classList.remove('hidden');
        } else {
            professionGroup.classList.add('hidden');
            firmNameGroup.classList.add('hidden');
        }
    });

    // Profession change → if Jeweller, show Firm Name
    professionSelect.addEventListener('change', () => {
        checkProfessionForFirmName();
    });

    function checkProfessionForFirmName() {
        const profession = professionSelect.value || '';
        if (profession.toLowerCase().includes('jeweller') || profession.includes('ज्वेलर')) {
            firmNameGroup.classList.remove('hidden');
        } else {
            firmNameGroup.classList.add('hidden');
        }
    }

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
        
        console.log('Sending Registration Data (FormData)...');

        fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            body: formData
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
