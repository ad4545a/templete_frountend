// API Configuration
const API_BASE_URL = (['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.hostname.startsWith('192.168.'))
    ? 'http://localhost:3000'
    : 'https://templete-backend.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('registration-form');
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    const progressBar = document.getElementById('progress-bar');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');

    // Inputs
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
    const privateJobGroup = document.getElementById('privateJobGroup');
    const govtGroup = document.getElementById('govtGroup');
    const otherJobGroup = document.getElementById('otherJobGroup');
    const whatsappSameCheckbox = document.getElementById('whatsapp-same');
    const mobileInput = document.getElementById('mobile');
    const whatsappInput = document.getElementById('whatsapp');
    const pincodeInput = document.getElementById('pincode');
    const profilePicInput = document.getElementById('profilePic');
    const dropZone = document.getElementById('drop-zone');
    const filePreview = document.getElementById('file-preview');

    let currentStep = 1;
    const totalSteps = 4;

    // --- Step Navigation ---

    function updateStepUI() {
        // Update Sections
        steps.forEach(step => {
            step.classList.add('hidden');
        });
        document.getElementById(`step-${currentStep}`).classList.remove('hidden');

        // Update Indicators
        stepIndicators.forEach((ind, index) => {
            const stepNum = index + 1;
            ind.classList.remove('active', 'completed');
            if (stepNum === currentStep) {
                ind.classList.add('active');
            } else if (stepNum < currentStep) {
                ind.classList.add('completed');
            }
        });

        // Update Progress Bar
        const progress = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;

        // Update Buttons
        if (currentStep === 1) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        if (currentStep === totalSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Validation for each step
    function validateStep(step) {
        const currentStepEl = document.getElementById(`step-${step}`);
        const requiredInputs = currentStepEl.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (!input.value || (input.type === 'tel' && input.value.length < 10)) {
                input.style.borderColor = 'var(--error)';
                input.classList.add('error-shake');
                setTimeout(() => input.classList.remove('error-shake'), 500);
                isValid = false;
            } else {
                input.style.borderColor = '#e5e7eb';
            }
        });

        return isValid;
    }

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepUI();
            }
        } else {
            // Shake animation or toast could go here
            console.log("Validation failed for step " + currentStep);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepUI();
        }
    });

    // --- Dynamic Form Logic ---

    // Title change → Husband/Father name label
    titleSelect.addEventListener('change', () => {
        if (titleSelect.value === 'Mrs') {
            fatherNameLabel.textContent = "Husband's Name / पति का नाम";
            fatherNameInput.placeholder = " "; // Keeping space for floating label
        } else {
            fatherNameLabel.textContent = "Father's Name / पिता का नाम";
            fatherNameInput.placeholder = " ";
        }
    });

    // Category change → Profession & Firm Name
    categorySelect.addEventListener('change', updateConditionalFields);
    professionSelect.addEventListener('change', updateConditionalFields);

    function updateConditionalFields() {
        const category = categorySelect.value;
        const profession = professionSelect.value || '';

        // Reset all conditional groups first
        professionGroup.classList.add('hidden');
        firmNameGroup.classList.add('hidden');
        privateJobGroup.classList.add('hidden');
        govtGroup.classList.add('hidden');
        otherJobGroup.classList.add('hidden');

        if (category === 'Samaj Member') {
            professionGroup.classList.remove('hidden');
            
            // Sub-logic based on profession
            if (profession.includes("Businessman") || profession.includes("व्यापारी") || profession.includes("Jeweller") || profession.includes("ज्वेलर")) {
                firmNameGroup.classList.remove('hidden');
            } else if (profession.includes("Private Job") || profession.includes("प्राइवेट नौकरी")) {
                privateJobGroup.classList.remove('hidden');
            } else if (profession.includes("Government Job") || profession.includes("सरकारी नौकरी")) {
                govtGroup.classList.remove('hidden');
            } else if (profession.includes("Other") || profession.includes("अन्य")) {
                otherJobGroup.classList.remove('hidden');
            }
        } else if (category === 'Jeweller') {
            firmNameGroup.classList.remove('hidden');
        }
    }

    // WhatsApp matching mobile
    whatsappSameCheckbox.addEventListener('change', () => {
        if (whatsappSameCheckbox.checked) {
            whatsappInput.value = mobileInput.value;
            whatsappInput.readOnly = true;
            whatsappInput.parentElement.classList.add('read-only-effect');
        } else {
            whatsappInput.readOnly = false;
            whatsappInput.parentElement.classList.remove('read-only-effect');
        }
    });

    mobileInput.addEventListener('input', () => {
        if (whatsappSameCheckbox.checked) {
            whatsappInput.value = mobileInput.value;
        }
    });

    // --- Location APIs ---

    // Load States
    const loadingOption = document.createElement('option');
    loadingOption.textContent = "Loading states... / लोड हो रहा है...";
    stateSelect.appendChild(loadingOption);

    fetch(`${API_BASE_URL}/api/states`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(states => {
            stateSelect.innerHTML = '<option value="" disabled selected></option>';
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Error loading states:", err);
            stateSelect.innerHTML = '<option value="" disabled selected>Error loading states / त्रुटि</option>';
        });

    // State Change
    stateSelect.addEventListener('change', () => {
        const state = stateSelect.value;
        districtSelect.innerHTML = '<option value="" disabled selected></option>';
        citySelect.innerHTML = '<option value="" disabled selected></option>';
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

    // District Change
    districtSelect.addEventListener('change', () => {
        const state = stateSelect.value;
        const district = districtSelect.value;
        citySelect.innerHTML = '<option value="" disabled selected></option>';
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

    // Smart Pincode Lookup (Optional but useful)
    pincodeInput.addEventListener('input', (e) => {
        const pincode = e.target.value;
        if (pincode.length === 6) {
            fetch(`https://api.postalpincode.in/pincode/${pincode}`)
                .then(res => res.json())
                .then(data => {
                    if (data[0].Status === "Success") {
                        const postOffices = data[0].PostOffice;
                        const state = postOffices[0].State;
                        const district = postOffices[0].District;

                        // Auto-select state if it exists in our dropdown
                        for (let option of stateSelect.options) {
                            if (option.value === state) {
                                stateSelect.value = state;
                                stateSelect.dispatchEvent(new Event('change'));

                                // Wait a bit for districts to load then set district
                                setTimeout(() => {
                                    for (let dOpt of districtSelect.options) {
                                        if (dOpt.value === district) {
                                            districtSelect.value = district;
                                            districtSelect.dispatchEvent(new Event('change'));
                                            break;
                                        }
                                    }
                                }, 800);
                                break;
                            }
                        }
                    }
                })
                .catch(err => console.log("Pincode API lookup failed", err));
        }
    });

    // --- File Upload Handling ---

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    ['dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, () => dropZone.classList.remove('drag-over'));
    });

    profilePicInput.addEventListener('change', handleFile);

    function handleFile(e) {
        const file = e.target.files[0] || e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = filePreview.querySelector('img');
                img.src = event.target.result;
                filePreview.querySelector('span').textContent = file.name;
                filePreview.classList.remove('hidden');
                dropZone.querySelector('.upload-icon-circle').classList.add('hidden');
                dropZone.querySelector('.upload-text').classList.add('hidden');
                dropZone.querySelector('.upload-subtext').classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    }

    // --- Final Submission ---

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        const formData = new FormData(form);

        fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(response => {
                if (response.success) {
                    form.classList.add('hidden');
                    document.getElementById('success-container').classList.remove('hidden');
                    updateStepUIUIForSuccess();
                } else {
                    throw new Error(response.error || 'Registration failed');
                }
            })
            .catch(err => {
                console.error('Registration Error:', err);
                alert(`Error: ${err.message}\nकृपया बाद में प्रयास करें।`);
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Complete Registration <i class="fas fa-check-circle"></i>';
            });
    });

    function updateStepUIUIForSuccess() {
        stepIndicators.forEach(ind => ind.classList.add('completed'));
        progressBar.style.width = '100%';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
