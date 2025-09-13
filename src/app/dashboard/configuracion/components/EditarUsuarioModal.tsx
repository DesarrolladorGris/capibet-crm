'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { supabaseService, UsuarioResponse, UsuarioData } from '@/services/supabaseService';

interface EditarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  usuario: UsuarioResponse | null;
}

export default function EditarUsuarioModal({ isOpen, onClose, onUserUpdated, usuario }: EditarUsuarioModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    agencyName: '',
    companyType: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    rol: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+54',
    country: 'Argentina',
    countryCode: 'ar',
    flag: 'https://flagcdn.com/w20/ar.png'
  });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Países de América del Norte y del Sur
  const americanCountries = useMemo(() => [
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
  ], []);

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && usuario) {
      setCurrentStep(1);
      setFormData({
        agencyName: usuario.nombre_agencia,
        companyType: usuario.tipo_empresa,
        name: usuario.nombre_usuario,
        email: usuario.correo_electronico,
        phone: usuario.telefono,
        password: '',
        confirmPassword: '',
        rol: usuario.rol
      });

      // Encontrar el país correspondiente
      const country = americanCountries.find(c => c.code === `+${usuario.codigo_pais}`);
      if (country) {
        setSelectedCountry(country);
      }

      setError('');
      setSuccess('');
      setIsLoading(false);
    }
  }, [isOpen, usuario, americanCountries]);

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
    
    if (!usuario) return;
    
    // Validaciones básicas
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }
    
    // Solo validar contraseñas si se ingresó una nueva
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password && formData.password.length < 6) {
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
      // Verificar si el email ya existe (solo si cambió)
      if (formData.email !== usuario.correo_electronico) {
        const emailCheck = await supabaseService.checkEmailExists(formData.email);
        if (emailCheck.success && emailCheck.data) {
          setError('Este email ya está registrado');
          setIsLoading(false);
          return;
        }
      }
      
      // Preparar los datos para actualizar
      const dataToUpdate: Partial<UsuarioData> = {
        nombre_agencia: formData.agencyName,
        tipo_empresa: formData.companyType,
        nombre_usuario: formData.name,
        correo_electronico: formData.email,
        telefono: formData.phone,
        codigo_pais: selectedCountry.code.replace('+', ''),
        rol: formData.rol,
        activo: true
      };

      // Solo incluir contraseña si se proporcionó una nueva
      if (formData.password && formData.password.trim() !== '') {
        dataToUpdate.contrasena = formData.password;
      }

      // Llamar al API para actualizar el usuario
      const result = await supabaseService.updateUsuario(usuario.id!, dataToUpdate);
      
      if (result.success) {
        setSuccess('¡Usuario actualizado exitosamente!');
        
        setTimeout(() => {
          onUserUpdated();
        }, 1500);
      } else {
        setError(result.error || 'Error al actualizar el usuario');
        setIsLoading(false);
        return;
      }
      
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !usuario) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#1a1d23] rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3a3d45]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#F29A1F] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">✏️</span>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Editar Usuario</h2>
              <p className="text-gray-400 text-sm">
                {currentStep === 1 ? 'Datos de la agencia' : 'Datos del usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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
                      placeholder="Nombre de la agencia"
                      className="w-full pl-10 pr-4 py-3 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] text-sm"
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
                      className="w-full pl-10 pr-4 py-3 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!formData.agencyName || !formData.companyType || isLoading}
                  className="bg-[#F29A1F] hover:bg-[#F29A1F] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Siguiente
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
                  placeholder="Nombre completo"
                  className="w-full pl-10 pr-4 py-3 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] text-sm"
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
                  className="w-full pl-10 pr-4 py-3 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] text-sm"
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
                      className="flex items-center space-x-2 px-3 py-3 bg-[#2a2d35] border border-[#3a3d45] border-r-0 rounded-l-lg text-white hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] min-w-[90px]"
                    >
                      <Image 
                        src={selectedCountry.flag} 
                        alt={`${selectedCountry.country} flag`}
                        width={16} 
                        height={12}
                        className="rounded-sm"
                      />
                      <span className="text-xs font-medium">{selectedCountry.code}</span>
                      <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Country Dropdown */}
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
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
                              width={16} 
                              height={12}
                              className="rounded-sm"
                            />
                            <span className="text-gray-300 flex-1 text-xs">{country.country}</span>
                            <span className="text-green-400 font-medium text-xs">{country.code}</span>
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
                    placeholder="Número de teléfono"
                    className="flex-1 px-4 py-3 bg-[#2a2d35] border border-[#3a3d45] rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] text-sm"
                    required
                  />
                </div>
              </div>

              {/* Rol Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] text-sm"
                  required
                >
                  <option value="Operador">Operador</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Password Input (opcional) */}
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
                  placeholder="Nueva contraseña (opcional)"
                  className="w-full pl-10 pr-12 py-3 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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

              {/* Confirm Password Input (solo si se ingresó contraseña) */}
              {formData.password && (
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
                    placeholder="Repetir nueva contraseña"
                    className="w-full pl-10 pr-12 py-3 bg-[#2a2d35] border border-[#3a3d45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
              )}

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

              {/* Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  ← Anterior
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#F29A1F] hover:bg-[#F29A1F] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
