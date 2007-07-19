/***
TODO:
- TeX Font
- Subscripts on things like M_pl
- Pictures of Earth and stuff
- Automate human blob
- Physical insights: 
  * tilt of blob because density of water is not one in Plank units
  * mass of stuff goes like size cubed, so masses are more spread
- Radius versus diameter
- More Energies: http://ippex.pppl.gov/interactive/energy/Vast_Scale_of_Energy.HTML
- Check Vac Energy 3meV from http://arxiv.org/PS_cache/arxiv/pdf/0706/0706.2186v2.pdf
- Chemistry reaction energies and time scales
- At every intersection with the axes, stick a 2 sig fig number like '3.2' whose exponent you can read off.
- Long timescales like proton decay and black hole decay.
- Distinguish agrogate versus invividual particles
- Uncertainties without making things complicated
- LaTeX formula(s) for each item relating it to other items.

Books:
Picture book 'orders of magnitude' by Phil Morrison
Weinberg's First 3 min

---------------------------------------
Fundamental Units
Jason Gallicchio
jason@physics.harvard.edu

Constants:
    c  = 299792458  m/s
    h  = 6.626069311E-34  J*s
    eV = 1.6021765314E-19  J
    Gn = 6.67421e-11  N m^2 / Kg^2
    kb = 1.380650524E-23  J/K

Conversions:
    L = f / c
    E = h f
    E = m c^2
    T = kb E

Planck Units (Standard Definitions):
    length = sqrt(hbar * Gn / (c*c*c) )  =  1.61624e-35  m
    time   = length / c                  =  5.39121e-44  s
    mass   = sqrt(hbar * c / Gn)         =  2.17645e-8   kg
    energy = mass * c * c                =  1.9561e9     J
    temp   = mass * c * c / kb           =  1.41679e32   K
    Note:  energy = hbar c / length      (hbar not h!)
    
Observations:
 *  Masses of composites are farther spaced -- 
    they go up with the cube of the length
 *  To get Schwarzschild radius, lookup Planck masses and
    go to same number in Planck lengths.
    
Please email any corrections, additions, or ideas
TODO: TeX font, subscripts and superscripts, 
      ledgend for colors
      human blob
      background pictures
      small number at every axis intersection
      Similar things avoid each other horizontally
------------------------------------------
***/

var units = function() {
    var c = 299792458 // m/s
    var h = 6.6260693e-34 // J*s
    var hbar = h / (2.0 * Math.PI)
    var eV = 1.60217653e-19 // J
    var Gn = 6.6742e-11 // N m^2 / Kg^2
    var kb = 1.3806505e-23 // J/K

    // Where do the 2pi's go?
    // E= h f   (= hbar w)
    // (h c / Gn)^1/2 * c * c = h c (h Gn / c^3 )^1/2
    // f = c/l 
    // Standard definitions involve hbar, but that means that E_pl = hbar / t_pl which is dumb
    
    // http://en.wikipedia.org/wiki/Planck_units
    var planck_length = Math.sqrt(hbar * Gn / (c*c*c) )  // 1.61624e-35 m
    //var planck_length = Math.sqrt(h * Gn / (c*c*c) )  // 4.05e-35 m
    var planck_time = planck_length / c                   // 5.39121e-44 s
    
    var planck_mass = Math.sqrt(hbar * c / Gn)           // 2.17645e-8 kg
    //var planck_mass = Math.sqrt(h * c / Gn)           // 5.4555e-8 kg
    var planck_energy = planck_mass * c * c              //    1.9561e9 J
    var planck_temp = planck_mass * c * c / kb           // 1.41679e32 K
    
    var planck_momentum = hbar / planck_length           //     6.52485 kg m/s
    
    var planck_force = planck_energy / planck_length    // 1.21027e44 N
    var planck_power = planck_energy / planck_time     //     3.62831e52 W
    var planck_area = planck_length * planck_length
    var planck_volume = planck_area*planck_length
    var planck_density = planck_mass / planck_volume  // 5.15500e96 kg/m3
    var planck_angular_freq = 1.0 / planck_time      // 1.85487e43 s-1
    var planck_pressure = planck_force / planck_area // 4.63309e113 Pa

    
    var units = {}   // Dict of units {'s': {dim:-1, planck: 1/planck_time }, 'm': {}...  }
    var unit_types = {}   // Ends up being a dict of arrays like { 'Time': ['s','yr'], 'Distance': ['m', 'km'] ]
    
    var addUnits = function(new_type) {
        unit_types[new_type] = []  // Add another unit type to the end
        // Look through all the units and see if they've been categorized already
        for (unit in units) {
            var member = false
            // Look at each of the category's arrays of units
            for (type in unit_types) {
                if (unit_types[type].indexOf(unit) > -1)
                    member = true
            }
            
            if (member == false)
                unit_types[new_type].push(unit)
        }
    }
    
    // 'planck' category says how many planck units are there in the given unit
    // Time
    units['s'] = {dim:-1, planck: 1/planck_time/(2.0 * Math.PI) }
    units['ms'] = {dim:-1, planck: units['s']['planck']/1e3 }
    units['us'] = {dim:-1, planck: units['s']['planck']/1e6 }
    units['ns'] = {dim:-1, planck: units['s']['planck']/1e9 }
    units['min'] = {dim:-1, planck: units['s']['planck']*60 }
    units['hour'] = {dim:-1, planck: units['min']['planck']*60 }
    units['day'] = {dim:-1, planck: units['hour']['planck']*24 }
    units['month'] = {dim:-1, planck: units['day']['planck']*30 }
    units['yr'] = {dim:-1, planck: units['s']['planck']*31556925.2 }
    units['kyr'] = {dim:-1, planck: units['yr']['planck']*1e3 }
    units['Myr'] = {dim:-1, planck: units['yr']['planck']*1e6 }
    units['Gyr'] = {dim:-1, planck: units['yr']['planck']*1e9 }
    // Frequency
    units['Hz'] = {dim:1, planck: planck_time*(2.0 * Math.PI) }
    units['kHz'] = {dim:1, planck: planck_time*1e3 }
    units['MHz'] = {dim:1, planck: planck_time*1e6 }
    units['GHz'] = {dim:1, planck: planck_time*1e9 }
    addUnits('Time')
    // Distance
    units['L_pl'] = {dim:-1, planck: 1 }
    units['m'] = {dim:-1, planck: 1/planck_length/(2.0 * Math.PI) }
    units['cm'] = {dim:-1, planck:  units['m']['planck']/1e2 }
    units['mm'] = {dim:-1, planck:  units['m']['planck']/1e3 }
    units['um'] = {dim:-1, planck:  units['m']['planck']/1e6 }
    units['nm'] = {dim:-1, planck:  units['m']['planck']/1e9 }
    units['pm'] = {dim:-1, planck:  units['m']['planck']/1e12 }
    units['A'] = {dim:-1, planck:   units['m']['planck']/1e10 }
    units['km'] = {dim:-1, planck:  units['m']['planck']*1e3 }
    units['ly'] = {dim:-1, planck:  units['m']['planck']*9.4605284e15 }
    units['pc'] = {dim:-1, planck:  units['m']['planck']*3.0856775807e16  }
    units['kpc'] = {dim:-1, planck:  units['pc']['planck']*1e3 }
    units['Mpc'] = {dim:-1, planck:  units['pc']['planck']*1e6 }
    addUnits('Distance')
    // Mass
    units['Kg'] = {dim:1, planck: 1/planck_mass }
    units['g'] = {dim:1, planck: units['Kg']['planck'] / 1000 }
    units['M_sun'] = {dim:1, planck: units['Kg']['planck'] * 1.98844E+30 }
    units['M_pl'] = {dim:1, planck: 1 }
    addUnits('Mass')
    // Energy
    units['J'] = {dim:1, planck: 1/planck_energy }
    units['erg'] = {dim:1, planck: units['J']['planck']*1e-7 }
    units['eV'] = {dim:1, planck: 1/planck_energy * eV }
    units['meV'] = {dim:1, planck: units['eV']['planck']*1e-3 }
    units['keV'] = {dim:1, planck: units['eV']['planck']*1e3 }
    units['MeV'] = {dim:1, planck: units['eV']['planck']*1e6 }
    units['GeV'] = {dim:1, planck: units['eV']['planck']*1e9 }
    units['TeV'] = {dim:1, planck: units['eV']['planck']*1e12 }
    addUnits('Energy')
    // Power
    units['W'] = {dim:2, planck: 1/planck_power }
    addUnits('Power')
    // Temperature
    units['K'] = {dim:1, planck: 1/planck_temp }
    units['MK'] = {dim:1, planck: units['K']['planck']*1e6 }
    addUnits('Temperature')
    // Density
    units['g/cm^3'] = {dim:4, planck: units['g']['planck'] / 
                                        Math.pow(units['cm']['planck'],3)}
    units['GeV/m^3'] = {dim:4, planck: units['GeV']['planck'] / 
                                        Math.pow(units['m']['planck'],3)}
    addUnits('Density')
    
    // In order of 
    var displayUnits = [ 'yr','s', 'm', 'K', 'eV', 'GeV', 'J', 'M_pl', 'Kg']
    var displayUnits = [ 'yr','day','s', 'pc', 'm', 'cm', 'L_pl', 'K', 'eV', 'GeV', 'erg', 'J', 'M_pl', 'g', 'Kg', 'M_sun']
    
    var displayCategories = ['Mass', 'Energy', 'Temperature', 'Distance', 'Time']
    
    var colors = {
        'particle': '#aa0000',
        'nuclear': '#aa0000', 
        'human': '#aa4400',
        'planetary': '#aa8800',
        'bio': '#338000',
        'chem': '#008066',
        'tech': '#0044aa',
        'astro': '#4400aa',
        'unit': 'black',
    }
    
    var whichType = function(unit) {
        for (type in unit_types) {
            if (unit_types[type].indexOf(unit) > -1)
                return type
        }
        return null
    }
    
   // Group things into times, distances, temperatures, energies, masses
    
    // Find: ('.*')
    // Replace: [\1],
    var data = [
    ['1 sec',1,'s', 'unit', true],
    ['1 min',1,'min', 'unit', false],
    ['1 hour',1,'hour', 'unit', false],
    ['1 day', 1, 'day', 'unit', false],
    ['1 year', 1, 'yr', 'unit', true],
    ['1 m',1,'m', 'unit', true],
    //['1cm',1,'cm', 'unit', true],  // Close to Earth Schwarzschild
    ['1 mm',1,'mm', 'unit', false],
    ['1 J',1,'J', 'unit', true],
    ['1 Kg',1,'Kg', 'unit', true],
    ['1 g',1,'g', 'unit', false],
    ['1 K',1,'K', 'unit', true],
    ['1 eV',1,'eV', 'unit', true],
    //['1u',1.66054021E-027,'Kg', 'unit', false],
    ['Gravitational Constant (Plank Mass)',1.22090e+19,'GeV', 'particle', true],
    ['Reduced Planck Mass',2.44e+18,'GeV', 'particle', false],
    ['Electron Mass',0.510998918,'MeV', 'particle', true],
    ['Proton Mass',.938272029,'GeV', 'particle', true],
    //['Deuteron mass',1875.61,'MeV', 'particle', false],
    //['W Boson Mass',80.425,'GeV', 'particle', false],
    ['Z Boson Mass',91.1876,'GeV', 'particle', true],
    ['Higgs vev (electroweak scale)',246.2,'GeV', 'particle', false],
    ['GUT Scale',1.00E+016,'GeV', 'particle', true],
    ['Electron Radius',2.82E-15,'m', 'particle', false],
    ['Compton Wavelength',3.86E-13,'m', 'particle', false],
    ['Bohr Radius',5.29E-11,'m', 'particle', false],
    //['parsec',3.09E+16,'m', 'astro', true],  // Too close to distance to nearest star
    //['Year',3.16E+07,'s', 'unit', false],
    //['sidereal year (fixed star)',31558149.8,'s', 'unit', false],
    ['Hubble Length',1.20E+26,'m', 'astro', false],
    ['Solar Mass',1.99E+30,'Kg', 'astro', true],
    ['Solar Radius',6.961E+08,'m', 'astro', false],
    //['Solar Luminosity',3.85E+26,'W', 'astro', false],
    ['Sun Schwarzschild radius',2.95325008,'km', 'astro', false],
    ['Earth Mass',5.9723E+24,'Kg', 'planetary', false],
    ['Earth Radius',6378.140,'km', 'planetary', false],
    ['Earth Sun Distance (au)',149597870660,'m', 'astro', true],
    ['Earth Moon Distance',3.84400000E+08,'m', 'astro', false],
    ['Earth Schwarzschild radius',8.87005622,'mm', 'astro', false],
    //['Radius of white dwarf with solar mass',5000,'km', 'astro', false],  // Too close to earth radius
    //['Radius of neutron star with solar mass',10,'km', 'astro', false],  // Too close to Height of Everest
    ['Moon Mass',7.35E+22,'Kg', 'planetary', false],  // earth = 81.3 moons
    ['Jupiter Mass',1.90E+27,'Kg', 'planetary', false],
    ['Jupiter Distance',7.79E+11,'m', 'astro', false],
    ['Nearest star (Proxima Centauri) Distance',4,'ly', 'astro', true],
    ['Galactic Center to Sun',8.0,'kpc', 'astro', false],
    ['Galactic disk of Milky Way Diameter',100000,'ly', 'astro', false],  // 33.3 kpc
    //['SN 1987A and LMC Distance',50,'kpc', 'astro', false],  // Too close to Galaxy Diameter
    ['Andromeda (nearest) Galaxy Distance',725,'kpc', 'astro', false],
    ['Local Group of galaxies Diameter',1.6,'Mpc', 'astro', false],
    ['Virgo cluster of galaxies Distance',14,'Mpc', 'astro', false],
    ['Local Supercluster Diameter',60,'Mpc', 'astro', false],
    //['Distance to certain quasars',1.0E+26,'m', 'astro', false],  // Too close to Hubble length
    //['Chandrasakhar (white dwarf limit)',1.5,'M_sun', 'astro', false],
    //['Oppenheimer-Volkov (neutron star limit)',2.0,'M_sun', 'astro', false],
    ['Visible Mass in Galaxy',2.00E+11,'M_sun', 'astro', false],
    ['All Mass in Galaxy',6.00E+11,'M_sun', 'astro', false],
    ['Black hole at center of our galaxy', 5.2e36, 'Kg', 'astro', false], // Taylor & Wheeler
    ['Black hole in center of Virgo cluster', 6e39, 'Kg', 'astro', false], // Taylor & Wheeler
    ['Mass in Universe',2.06E+55,'g', 'astro', true],
    ['Age of Universe',13.7,'Gyr', 'astro', true],
    //['Critical Density per cm^3',9.5E-30,'g', 'astro', false],  // These are all too close to Cosmological Constant
    //['Critical Density',9.5E-30,'g/cm^3', 'astro', false],
    ['Critical Density',1.05369e-5*(.71)*(.71)*1e6,'GeV/m^3', 'astro', false],  // 5.3  http://pdg.lbl.gov/2004/reviews/astrorpp.pdf
    //['Critical Density',2.55,'meV', 'astro', false],
    ['Cosmological Constant (Vac Energy Density)',Math.pow(.73,0.25)*2.55,'meV', 'particle', false],  // 3meV from http://arxiv.org/PS_cache/arxiv/pdf/0706/0706.2186v2.pdf
    //['Density of Dark Matter',Math.pow(0.22,0.25)*2.55,'meV', 'particle', false],  // 3meV from http://arxiv.org/PS_cache/arxiv/pdf/0706/0706.2186v2.pdf

    ['CMB Temperature',2.7,'K', 'astro', true],
    //['Sky Brightness Temp (Synchrotron)',200,'K', 'astro', false],
    ['Room Temperature',300,'K', 'human', false],
    //['Earth Highest Temperature',58+273.15,'K', 'planetary', false],
    //['Earth Lowest Temperature',89.2+273.15,'K', 'planetary', false],
    //['Boiling',373.15,'K', 'human', false],   // Boiling and freezing are too close
    //['Freezing Water',273.15,'K', 'human', false],
    //['Neutrino Temp',1.9,'K', 'astro', false],
    ['Tallest Building height',508.0,'m', 'human', false],
    ['Tallest Building mass',700000000,'Kg', 'human', false],
    
    //['Lowest temp reached',2.17e-8,'K'], //3.0E-31,'J', 'tech', false], 
    //['Lowest temp for nuclear magnetic ordering', 100e-12,'K', 'tech', false], //3.0E-31,'J'],  //  at Helsinki
    //['KE of molecule at room temp',4.4E-21,'J', 'planetary', false],
    ['Lowest temp for helium dilution fridge', 1.7e-3,'K', 'tech', false], //3.0E-31,'J'], 
    //['Boiling point of bound helium', 4.22, 'K', 'tech', false],  // Too close to CMB
    //['Temp on Pluto', 44, 'K', 'astro', false],  // Too close to liquid nitrogen temp
    ['Liquid Nitrogen temp', 77.35, 'K', 'tech', false],
    //['Melting point of tungsten', 3683, 'K', 'tech', false],  // Too close to Sun surface temp
    ['Temp in supernova explosions', 10e9, 'K', 'astro', false],
    ['Temperature on Venus', 737, 'K', 'astro', false],
    //['Melting point of aluminum', 933.47, 'K', 'tech', false],  // Too close to temp of Venus
    
    
    ['Neutrino mass upper bound',2,'eV', 'particle', false],  // http://pdglive.lbl.gov/Rsummary.brl?nodein=S066&fsizein=1
    ['Neutrino mass cosmology upper bound',0.4,'eV', 'particle', false],  // http://pdg.lbl.gov/2007/reviews/numixrpp.pdf
    ['Neutrino mass difference solar delta m_21', Math.sqrt(8e-5) *1000, 'meV', 'particle', false],
    ['Neutrino mass difference atmosphere delta m_32', Math.sqrt(2.5e-3) *1000, 'meV', 'particle', false],  // 1.9-3.0 is the range http://pdg.lbl.gov/2007/reviews/numixrpp.pdf
    
    ['Fission of one U-235',200,'MeV', 'nuclear', false],
    ['Flying mosquito kinetic energy',1.0001,'TeV', 'bio', false],
    ['LHC p-p collisions',15,'TeV', 'particle', false],
    ['LHC Pb-Pb collisions',1250,'TeV', 'particle', false],
    ['GZK limit for energy of a cosmic ray', 5e19, 'eV', 'astro', false],
    ['Most energetic cosmic ray ever detected',3.0E+20,'eV', 'astro', false],
    //['Average person using a baseball bat', 80, 'J', 'human', false],  // Too close to most energetic cosmic ray
    ['Bullet Kinetic Energy (AK74 at 900 m/s)', 14203,'J', 'human', false],
    ['Energy in 1g of sugar or protein', 3.8e4, 'J', 'human', false],
    ['Car Kinetic Energy',3.0E+05,'J', 'human', false],
    //['typical serving of staple food', 1e6, 'J', 'human', false], // Close to GUT Scale
    ['Food energy a human consumes in a day',8.4E+06,'J', 'human', false],  // 2000 Kcal
    //['Exploding 1Kg of TNT',4.184e+06,'J', 'human', false],  // To close to Food energy a human consumes and NIF laser
    ['Lightning bolt energy',1.5E+09,'J', 'planetary', false],
    ['Exploding 1 ton of TNT',4.184e9,'J', 'tech', false],
    ['Largest conventional bomb (MOAB)',4.184e9*11,'J', 'tech', false], // http://en.wikipedia.org/wiki/MOAB
    ['Largest conventional bomb test (600 ton TNT)',4.184e9*600,'J', 'tech', false],  // http://www.washingtonpost.com/wp-dyn/content/article/2006/03/30/AR2006033001735.html
    ['Hiroshima blast',4.2E+06*1000*13000,'J', 'tech', false], // http://en.wikipedia.org/wiki/MOAB
    ['Largest nuclear weapon tested energy',2.5E+17,'J', 'tech', false],
    ['Energy consumed by the world in one year (2001)',4.3E+20,'J', 'human', false],
    ["Energy in world's fossil fuel reserves (2003)",3.9E+22,'J', 'planetary', false],
    ['Energy output of the Sun in one second',3.8E+26,'J', 'astro', false],
    ['Energy output of the Sun in one year',3.8E+26*31556926,'J', 'astro', false],
    ["Energy in world's U-238 reserves (2003)",3.0E+31,'J', 'planetary', false],
    ['Earth gravitational binding energy',2.4E+32,'J', 'planetary', false],
    ['Sun gravitational binding energy',6.9E+41,'J', 'astro', false],
    ['Energy released in a gamma ray burst',1.0E+47,'J', 'astro', false],
    
    ['Gamma Rays',1.001,'pm', 'nuclear', false],
    ['X-Rays',100,'pm', 'nuclear', false],
    //['Visible Light',400,'nm', 'nuclear', false],
    ['Violet Light',400,'nm', 'chem', false],
    ['Red Light',750,'nm', 'chem', false],
    //['hc=1240 nm eV',1240,'nm', 'chem', false],  // Just a check to make sure 1240nm lines up with 1eV
    ['DNA helix diameter',2,'nm', 'bio', false],
    ['HIV (average size) virus size',90,'nm', 'bio', false],
    ['Bacteria diameter',3.2,'um', 'bio', false],
    ['Blood cell / Spider web / Eukaryotic nucleus',7,'um', 'bio', false],
    ['Human Hair width',80,'um', 'human', false],
    ['Height of Everest',8.848,'km', 'human', false],
    //['Mean depth of Ocean', 3.600, 'km', 'planetary', false],
    //['deepest ocean trench',10.911,'km', 'planetary', false],
    ['Height of Olympus Mons on Mars', 27.000, 'km', 'planetary', false],
    ['Weather Balloon max height', 40, 'km', 'planetary', false],
    ['Low Earth Orbit minimum height', 200, 'km', 'planetary', false],
    ['Geosynch Orbit Distance', 3.6e7, 'm', 'planetary', false],
    //['length of the Great Wall of China',6.4e6,'m', 'human', false],  // Same as Earth Radius and not sure if it's right
    ['Lead-208 atom mass',3.5E-25,'Kg', 'nuclear', false],
    ['Small virus mass',1.0E-20,'Kg', 'bio', false],
    ['E. coli bacterium mass',7.0E-16,'Kg', 'bio', false],
    ['Avg. human cell mass',1.0E-12,'Kg', 'bio', false],
    ['Mosquito mass',1.5E-03,'g', 'bio', false],
    ['Blue whale mass',1.0E+05,'Kg', 'bio', false],
    ['Human mass',100,'Kg', 'human', false],
    ['Titanic mass',2.6E+07,'Kg', 'human', false],
    ["Earth's oceans mass",1.4E+21,'Kg', 'planetary', false],
    ['Virgo Supercluster mass',2.0E+46,'Kg', 'astro', false],
    //['Time left for Sun',9,'Gyr', 'astro', false],
    ['WiFi and Microwave ovens', 2.4, 'GHz', 'tech', false],
    ['FM Radio and TV', 100, 'MHz', 'tech', false],
    ['AM Radio', 1.0001, 'MHz', 'tech', false],
    ['Human Hearing upper limit', 20, 'kHz', 'human', false],
    ['Human Hearing lower limit', 20, 'Hz', 'human', false],
    ['Density of Water', 1.0001, 'g/cm^3', 'human', false],
    ['Hydrogen hyperfine splitting of spins', 21, 'cm', 'chem', false],
    ['Sun surface temp', 5785, 'K', 'astro', false],
    ['Sun core temp', 13.6, 'MK', 'astro', false],
    ['Local Disk Density', 1.0001e-23, 'g/cm^3', 'astro', false],
    ['Local Halo Density', 1.0001e-24, 'g/cm^3', 'astro', false],
    ['Age of Earth, Sun, and Life', 4.5, 'Gyr', 'astro', false],
    //['Age of Life on Earth', 4, 'Gyr', 'planetary', false],
    //['Age of Cells on Earth', 3.5, 'Gyr', 'planetary', false],
    //['Age of Photosynthesis on Earth', 3, 'Gyr', 'planetary', false],
    ['Age of Eukaryotic cells on Earth', 2, 'Gyr', 'planetary', false],
    ['Age of Multicellular life on Earth', 1.00001, 'Gyr', 'planetary', false],
    ['Age of Life on Land', 500, 'Myr', 'planetary', false],
    ['Age of Dinosaur Extinction', 65, 'Myr', 'planetary', false],
    //['Age of genus Homo', 2, 'Myr', 'planetary', false],
    ['Age of control of fire', 1.0001, 'Myr', 'human', false],
    ['Age of Homo sapiens', 200, 'kyr', 'human', false],
    //['Age of Humans living on all continents', 11, 'kyr', 'human', false],
    //['Age of Agriculture', 8000, 'yr', 'human', false],
    ['Age of Civilization', 6000, 'yr', 'human', false],
    //['Age of Space Flight', 50, 'yr', 'human', false],
    ['Lifespan of Person', 100, 'yr', 'human', false],
    //['Energy to switch transistor', 999, 'J', 'tech', false],  // 1/2 C V^2
    ['Energy of biggest laser pulse @ NIF 1ns (check)', 3e6, 'J', 'tech', false],  // Too close to 
    ['Energy of a well-hit tennis ball (check)', 1e20, 'eV', 'human', false],
    // Energy release in a nova, supernovae, hypernovae
    // Tidal energy delivered to earth in one moon orbit
    // K-T impact that wiped out the dinosaurs
    ['Transistor channel length (2007)', 45, 'nm', 'tech', false],
    ['Energy released to the collapse to a neutron star', 1e55, 'erg', 'astro', false],  // SN is collapse to white dwarf
    //['Energy used by a human in a lifetime', // 1-10 kW continuous
    // Energy used by the world in a year
    ['Supernova 1A temp (lasts seconds)', 1e6, 'K', 'astro', false],
    ['Supernova 1A energy released', 1e46, 'J', 'astro', false],
    // Time for cosmic inflation
    ['Time for sun to orbit galaxy (galactic year)', 226e6, 'yr', 'astro', false],
    // Hawking temperature of BH the size of the sun OR Size of BH whose hawking temp is same as sun
    // Kardeschev civilization categories (type 0, type 1, etc.)
    ['Energy in reactions in sun', 1.0001, 'keV', 'astro', false],
    ['Energy in reactions in red giants', 100, 'keV', 'astro', false],
    ['Energy in reactions in Supernovae', 50, 'MeV', 'astro', false],
    ['Early Universe (Re)combination temp', .24, 'eV', 'astro', false],
    ]

    // TODO: Add all units instead of having them on top.
    
    var numbers = [
    ['stars in visible univ', 7e22],
    ['Greek Civilization bits', 1e9],
    ['Human Genome', 6.4e9],
    ['Library Of Congres bits (20 Tb)', 1.5e14],
    ]
    
    var velocities = [
    ['Earth Orbit', 29.8, 'km/s']
    // Speed of sun around mikly way
    ]
    
    var tbody = $('fundamental_units_body')
    var Mpls = []
    
    var scientificNotation = function(num, digits) {
        var log10 = Math.log(num)/Math.LN10
        var exp = Math.floor(log10)
        var base = num / Math.pow(10, exp)
        var base_str = base.toPrecision(digits)
        return base_str + 'e' + exp
    }
    
    for (var i=0; i<data.length; i++)
    {
        var name = data[i][0]
        var value = data[i][1]
        var unit = data[i][2]
        var pl_units = value*units[unit].planck  // A time, for eg is now in units of planck_time
        var pl_masses = Math.pow(pl_units,1/units[unit].dim)
        data[i][5] = pl_masses
        var gev = pl_masses / units['GeV'].planck
        if (pl_masses!=0)
            Mpls.push(pl_masses)
        else
            log('***There is a problem with', name, value, unit)
        //log(name, value, unit, 'pl_units=', pl_units, 'pl_masses=', pl_masses, 'GeV=', gev)
        
        /*
        var tr = TR(null, TD(null, name),
                           TD(null, value),
                           TD(null, unit),
                           TD(null, scientificNotation(pl_units,2)),
                           TD(null, scientificNotation(pl_masses,2)),
                           TD(null, scientificNotation(gev,2)) )
        appendChildNodes(tbody, tr)
        */
    }
    
    var width = 1400
    var height = 2400
    var p = new SVGPlot(width, height)
    replaceChildNodes('svg_div', p.svg.htmlElement)
    var doit = function() {
        var sortNumber = function(a,b) {
            return a - b
        }
        Mpls.sort(sortNumber)
        
        var margin = 20;
        p.addBox('float', margin, margin, width-margin*2, height-margin*2)
        
        var log10 = function(num) {
            return Math.log(num)/Math.LN10
        }
        
        var loground = function(num, direction) {
            // Direction is >0 or <0.
            // num gets rounded to the nearest power of ten in that direction
            var log10 = Math.log(num)/Math.LN10
            if (direction<0)
                log10 = Math.floor(log10)
            if (direction>0)
                log10 = Math.ceil(log10)
            return Math.pow(10, log10)
        }
        
        var everyNDecade = function(bottom, top, n) {
            // n can be positive to go up and negative to go down
            // Bottom and top are huge or tiny numbers
            // It returns multiples of n in addition to intervals of n (10^0 is included)
            // what's returned is an array like [0.000001, 0.001, 1, 1000, 1000000]
            // This works even when top<bottom and n is negative.
            // Eg:  everyNDecade(1e-6,1e12,3)   and    everyNDecade(1e6,1e-12,-3)
            var decades = []
            with (Math) {
                var start = pow(10, ceil(round(log10(bottom))/n)*n)
                for (var x = start; n>0 ? x<=top : x>=top; x *= pow(10, n)) {
                    decades.push(x)
                }
            }
            return decades
        }
        
        var min_mpl = loground(Mpls[0], -1)
        var max_mpl = loground(Mpls[Mpls.length-1], 1)*10
        p.addView()
        p.setXScale(-1, Mpls.length+1)
        p.setYScale(min_mpl, max_mpl)
        p.yScale.interpolation = 'log'
        var plot = p.logplot(Mpls)
       
        // Add all of the axes
        var displayAxes = []
        forEach(displayUnits, function(unit) {
            var dim = units[unit].dim
            var planck = units[unit].planck
            
            var bottom = Math.pow(min_mpl,dim)/planck
            var top = Math.pow(max_mpl,dim)/planck

            var bottom_round = loground(bottom, -dim)
            var top_round = loground(top, dim)
            
            var decades = everyNDecade(bottom_round, top_round, dim)
            var convertToMpl = function(x) {
                return Math.pow(x*planck, dim)
            }
            var locations = map(convertToMpl, decades);
            
            var decades3 = everyNDecade(bottom_round, top_round, 3*dim)
            var locations3 = map(convertToMpl, decades3);
            
            var scientific = function(num) {
                //return scientificNotation(num, 2)
                return Math.round( log10(num) )
            }
            var decades3_sci = map(scientific, decades3);
            
            var axis = p.addYAxis('left')  // Add axes at specific x-locations
            p.addYTicks(locations, 'left')
            p.addYTickLabels(locations3, decades3_sci, 'left')
            displayAxes.push(axis)
        })
        
        p.render()
        
        // Remove the actual line from the plot.
        plot.element.parentNode.removeChild(plot.element)
        
        // Move axes over into groups and label them
        var offsets = {}
        var smallest_location = 0;
        p.fontSize = 10
        p.fontWeight = 'bold'
        p.textAnchor = 'middle'
        var axis_size = 26
        var special_offsets = {'M_sun':-10, 'M_pl':5, 'J':-5, 'erg':-5, 'eV':5, 'L_pl':-10, 'pc':5, 's':-10, 'day':-5, 'yr':5}
        for (var i=0; i< displayUnits.length; i++) {
            var unit = displayUnits[i]
            var axis = displayAxes[i]
            var type = whichType(unit)
            var offset = offsets[type]
            if (offset == null)
                offset = 0
            var index = displayCategories.indexOf(type)
            var location = index*width/displayCategories.length + offset
            smallest_location = Math.min(smallest_location,location)
            //log(unit, getNodeAttribute(axis.element, 'cmd'), type, offset, index, location)
            setNodeAttribute(axis.element, 'transform', 'translate('+location+')')
            offsets[type] = offset - axis_size  // Each axis is about 20 pixels wide
            
            // Put a label on top of the axis
            var spec_off = special_offsets[unit]
            if (spec_off == null)
                spec_off = 0
            var text_offset = location+spec_off+axis_size/2+2
            p.text(unit, text_offset, 10)
            p.text(unit, text_offset, height-5)
        }
        
        // Draw Horizontal Lines for the data points and label them
        //p.strokeStyle = 'rgba(0.5,0.5,0.5,0.1)'
        //p.strokeStyle = 'rgba(0.1,0.1,0.1,1.0)'
        p.currentGroup = p.view.element
        p.fontSize = 7
        p.fontWeight = null
        p.textAnchor = null
        //var offset = 0
        
        // Draw Lines
        forEach(data, function(item) {
            var name = item[0]
            var value = item[1]
            var unit = item[2]
            var category = item[3]
            var bold = item[4]
            var pl_masses = item[5]
            var type = whichType(unit)
            if ( name.search('ass') > -1 && unit.search('eV') > -1 )
                type = 'Mass'
            var index = displayCategories.indexOf(type)
            if (index > -1) {
                p.strokeStyle = colors[category]
                p.globalAlpha = bold ? 0.40 : 0.08
                p.beginPath()
                var j = p.view.ytoj(pl_masses)
                p.moveTo(smallest_location-15, j)
                p.lineTo(width, j)
                p.stroke()
            }
        })
        
        // Draw Text
        forEach(data, function(item) {
            var name = item[0]
            var value = item[1]
            var unit = item[2]
            var category = item[3]
            var bold = item[4]
            var pl_masses = item[5]
            var type = whichType(unit)
            if ( name.search('ass') > -1 && unit.search('eV') > -1 )
                type = 'Mass'
            var index = displayCategories.indexOf(type)
            if (index > -1) {
                var j = p.view.ytoj(pl_masses)
                p.fillStyle = colors[category]
                p.fontWeight = bold ? 'bolder' : 'normal'
                //p.fontSize = bold ? 9 : 7  // Too noisy and text too big
                var text
                if (value == 1)
                    text = name
                else if (value >= .0001 && value <= 9999)
                    text = name + '  (' + parseFloat(value.toPrecision(2)) + ' ' + unit + ')'
                else {
                    text = name + '  (' + value.toPrecision(2) + ' ' + unit + ')'
                }
                // Put label 10 pixels away from the nearest axis
                p.globalAlpha = 1.0
                p.text(text, 10+index*width/displayCategories.length, j)
            }
        })
        
        // Ledgend
        var j=height/30
        for(var category in colors) {
            if (category != 'nuclear') {  // Now color-coded like particle
                p.globalAlpha = 1.0
                p.fillStyle = colors[category]
                p.strokeStyle = colors[category]
                p.fontWeight = 'bolder'
                p.fontSize = '12px'
                p.globalAlpha = 0.40
                p.beginPath()
                p.moveTo(width*0.85, j)
                p.lineTo(width*0.90, j)
                p.stroke()
                p.globalAlpha = 1.0
                p.text(category, width*0.85, j-1)
                j += 15
            }
        }
    }
    
    p.svg.whenReady(doit)
    var form = p.svg.convertForm()
    appendChildNodes('form_div', form)
}

addLoadEvent(units);
