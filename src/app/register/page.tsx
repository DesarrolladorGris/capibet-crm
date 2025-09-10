'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usuarioService, UsuarioData } from '@/services/usuarioServices';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    agencyName: '',
    companyType: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+54',
    country: 'Argentina',
    countryCode: 'ar',
    flag: 'https://flagcdn.com/w20/ar.png'
  });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Países de América del Norte y del Sur
  const americanCountries = [
    { code: '+1', country: 'United States', countryCode: 'us', flag: 'https://flagcdn.com/w20/us.png' },
    { code: '+1', country: 'Canada', countryCode: 'ca', flag: 'https://flagcdn.com/w20/ca.png' },
    { code: '+52', country: 'Mexico', countryCode: 'mx', flag: 'https://flagcdn.com/w20/mx.png' },
    { code: '+54', country: 'Argentina', countryCode: 'ar', flag: 'https://flagcdn.com/w20/ar.png' },
    { code: '+55', country: 'Brazil', countryCode: 'br', flag: 'https://flagcdn.com/w20/br.png' },
    { code: '+56', country: 'Chile', countryCode: 'cl', flag: 'https://flagcdn.com/w20/cl.png' },
    { code: '+57', country: 'Colombia', countryCode: 'co', flag: 'https://flagcdn.com/w20/co.png' },
    { code: '+58', country: 'Venezuela', countryCode: 've', flag: 'https://flagcdn.com/w20/ve.png' },
    { code: '+51', country: 'Peru', countryCode: 'pe', flag: 'https://flagcdn.com/w20/pe.png' },
    { code: '+593', country: 'Ecuador', countryCode: 'ec', flag: 'https://flagcdn.com/w20/ec.png' },
    { code: '+591', country: 'Bolivia', countryCode: 'bo', flag: 'https://flagcdn.com/w20/bo.png' },
    { code: '+595', country: 'Paraguay', countryCode: 'py', flag: 'https://flagcdn.com/w20/py.png' },
    { code: '+598', country: 'Uruguay', countryCode: 'uy', flag: 'https://flagcdn.com/w20/uy.png' },
    { code: '+594', country: 'French Guiana', countryCode: 'gf', flag: 'https://flagcdn.com/w20/gf.png' },
    { code: '+597', country: 'Suriname', countryCode: 'sr', flag: 'https://flagcdn.com/w20/sr.png' },
    { code: '+592', country: 'Guyana', countryCode: 'gy', flag: 'https://flagcdn.com/w20/gy.png' },
    { code: '+502', country: 'Guatemala', countryCode: 'gt', flag: 'https://flagcdn.com/w20/gt.png' },
    { code: '+503', country: 'El Salvador', countryCode: 'sv', flag: 'https://flagcdn.com/w20/sv.png' },
    { code: '+504', country: 'Honduras', countryCode: 'hn', flag: 'https://flagcdn.com/w20/hn.png' },
    { code: '+505', country: 'Nicaragua', countryCode: 'ni', flag: 'https://flagcdn.com/w20/ni.png' },
    { code: '+506', country: 'Costa Rica', countryCode: 'cr', flag: 'https://flagcdn.com/w20/cr.png' },
    { code: '+507', country: 'Panama', countryCode: 'pa', flag: 'https://flagcdn.com/w20/pa.png' },
    { code: '+509', country: 'Haiti', countryCode: 'ht', flag: 'https://flagcdn.com/w20/ht.png' },
    { code: '+1', country: 'Dominican Republic', countryCode: 'do', flag: 'https://flagcdn.com/w20/do.png' },
    { code: '+1', country: 'Jamaica', countryCode: 'jm', flag: 'https://flagcdn.com/w20/jm.png' },
    { code: '+1', country: 'Trinidad and Tobago', countryCode: 'tt', flag: 'https://flagcdn.com/w20/tt.png' },
    { code: '+1', country: 'Barbados', countryCode: 'bb', flag: 'https://flagcdn.com/w20/bb.png' },
    { code: '+1', country: 'Bahamas', countryCode: 'bs', flag: 'https://flagcdn.com/w20/bs.png' }
  ];

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (formData.agencyName && formData.companyType) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleCountrySelect = (country: typeof selectedCountry) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validaciones básicas
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verificar si el email ya existe
      const emailCheck = await usuarioService.checkEmailExists(formData.email);
      
      if (emailCheck.success && emailCheck.data) {
        setError('Este email ya está registrado');
        setIsLoading(false);
        return;
      }
      
      // Preparar datos para la API
      const userData: UsuarioData = {
        nombre_agencia: formData.agencyName,
        tipo_empresa: formData.companyType,
        nombre_usuario: formData.name,
        correo_electronico: formData.email,
        telefono: formData.phone,
        codigo_pais: selectedCountry.code.replace('+', ''),
        contrasena: formData.password,
        rol: 'Operador',
        activo: true
      };
      
      // Crear usuario en Supabase
      const result = await usuarioService.createUsuario(userData);
      
      if (result.success) {
        setSuccess('¡Registro exitoso! Redirigiendo al login...');
        
        // Guardar algunos datos en localStorage para mejor UX
        localStorage.setItem('registeredEmail', formData.email);
        
        // Redireccionar al login después de 2 segundos
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        
      } else {
        setError(result.error || 'Error al crear la cuenta. Inténtalo de nuevo.');
        console.error('Registration error:', result);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setError('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Beast Logo */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-[#00b894] rounded-full flex items-center justify-center border-2 border-[#00a085] shadow-lg">
              <div className="text-slate-900 font-bold text-2xl transform -rotate-12">
                ⚡
              </div>
            </div>
            <h1 className="text-white text-2xl font-bold mt-2">BEAST</h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="h-0.5 w-8 bg-[#00b894]"></div>
              <span className="text-[#00b894] text-sm font-medium tracking-wider">CRM</span>
              <div className="h-0.5 w-8 bg-[#00b894]"></div>
            </div>
          </div>
          
          <h2 className="text-white text-xl lg:text-2xl font-semibold mb-2">Crear tu cuenta</h2>
          <p className="text-gray-400 text-sm lg:text-base">
            {currentStep === 1 ? 'Ingrese los datos de su agencia.' : 'Ingrese sus datos de usuario.'}
          </p>
        </div>

        {/* Form */}
        {currentStep === 1 ? (
          <div className="space-y-6">
            {/* Step 1: Agency and Company Type */}
            <div className="space-y-4">
              {/* Agency Name */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Nombre de la agencia</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="agencyName"
                    value={formData.agencyName}
                    onChange={handleInputChange}
                    placeholder="Tu Agencia"
                    className="w-full pl-10 pr-4 py-4 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] text-base"
                    required
                  />
                </div>
              </div>

              {/* Company Type */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Tipo de empresa</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0l4 6-4 6H8l-4-6 4-6h8z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleInputChange}
                    placeholder="Tipo de empresa"
                    className="w-full pl-10 pr-4 py-4 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] text-base"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Link 
                href="/login"
                className="w-14 h-14 lg:w-12 lg:h-12 bg-[#00b894] hover:bg-[#00a085] rounded-full flex items-center justify-center text-white transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!formData.agencyName || !formData.companyType}
                className="w-14 h-14 lg:w-12 lg:h-12 bg-[#00b894] hover:bg-[#00a085] disabled:bg-slate-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 2: User Details */}
            {/* Name Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Mi nombre"
                className="w-full pl-10 pr-4 py-3 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] text-base"
                required
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Correo electrónico"
                className="w-full pl-10 pr-4 py-3 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] text-base"
                required
              />
            </div>

            {/* Phone Input */}
            <div className="relative">
              <div className="flex">
                {/* Country Selector */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center space-x-2 px-3 py-4 bg-[#2a2d35] border border-[#3a3d45] border-r-0 rounded-l-lg text-white hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] min-w-[100px]"
                  >
                    <Image 
                      src={selectedCountry.flag} 
                      alt={`${selectedCountry.country} flag`}
                      width={20} 
                      height={15}
                      className="rounded-sm"
                    />
                    <span className="text-sm font-medium">{selectedCountry.code}</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {americanCountries.map((country, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleCountrySelect(country)}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-slate-700 text-white text-sm transition-colors duration-150"
                        >
                          <Image 
                            src={country.flag} 
                            alt={`${country.country} flag`}
                            width={20} 
                            height={15}
                            className="rounded-sm"
                          />
                          <span className="text-gray-300 flex-1">{country.country}</span>
                          <span className="text-gray-400">({country.code})</span>
                          <span className="text-green-400 font-medium">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone Number Input */}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder=""
                  className="flex-1 px-4 py-4 bg-[#2a2d35] border border-[#3a3d45] rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] text-base"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Contraseña"
                className="w-full pl-10 pr-12 py-4 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-slate-600/30 rounded-r-lg transition-colors duration-200"
              >
                <div className="p-1 rounded-full hover:bg-slate-600/50 transition-colors duration-200">
                  <svg className="h-4 w-4 text-gray-400 hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </div>
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Repetir contraseña"
                className="w-full pl-10 pr-12 py-4 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-slate-600/30 rounded-r-lg transition-colors duration-200"
              >
                <div className="p-1 rounded-full hover:bg-slate-600/50 transition-colors duration-200">
                  <svg className="h-4 w-4 text-gray-400 hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </div>
              </button>
            </div>

            {/* Remember Password Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberPassword"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500 focus:ring-2"
              />
              <label htmlFor="rememberPassword" className="text-gray-400 text-sm">
                Recuérdame la contraseña
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-4 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:ring-offset-2 focus:ring-offset-[#1a1d23] mt-6 text-base"
            >
              {isLoading ? 'REGISTRANDO...' : 'REGISTRAR'}
            </button>

            {/* Back to Step 1 Button */}
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-full text-gray-400 hover:text-white font-medium py-2 transition-colors duration-200"
            >
              ← Volver al paso anterior
            </button>
          </form>
        )}

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-[#00b894] hover:text-[#00a085] font-medium">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
