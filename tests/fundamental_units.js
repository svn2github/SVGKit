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
- Categorize ['Astronomy/Cosmology', 'Particle Physics', 'Biology/Chemistry', 'Human Scale']
- Check Vac Energy
- Chemistry reaction energies and time scales
- At every intersection with the axes, stick a 2 sig fig number like '3.2' whose exponent you can read off.
- Distinguish agrogate versus invividual particles

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
      color-code categories, background pictures,
      small number at every axis intersection
------------------------------------------
***/

var units = function() {
    var c = 299792458 // m/s
    var h = 6.626069311E-34 // J*s
    var hbar = h / (2.0 * Math.PI)
    var eV = 1.6021765314E-19 // J
    var Gn = 6.67421e-11 // N m^2 / Kg^2
    var kb = 1.380650524E-23 // J/K

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
    units['yr'] = {dim:-1, planck: units['s']['planck']*31556926 }
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
    units['pc'] = {dim:-1, planck:  units['m']['planck']*3.08568025e16  }
    units['kpc'] = {dim:-1, planck:  units['pc']['planck']*1e3 }
    units['Mpc'] = {dim:-1, planck:  units['pc']['planck']*1e6 }
    addUnits('Distance')
    // Mass
    units['Kg'] = {dim:1, planck: 1/planck_mass }
    units['g'] = {dim:1, planck: units['Kg']['planck'] / 1000 }
    units['M_sun'] = {dim:1, planck: units['Kg']['planck'] * 1.988443E+30 }
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
    ['sec',1,'s'],
    ['min',1,'min'],
    ['hour',1,'hour'],
    ['day', 1, 'day'],
    ['year', 1, 'yr'],
    ['m',1,'m'],
    //['1cm',1,'cm'],  // Close to Earth Schwarzschild
    ['mm',1,'mm'],
    ['J',1,'J'],
    ['Kg',1,'Kg'],
    ['g',1,'g'],
    ['K',1,'K'],
    ['eV',1,'eV'],
    //['1u',1.66054021E-027,'Kg'],
    ['Gravitational Constant (Plank Mass)',1.22089836113838e+19,'GeV'],
    ['Reduced Planck Mass',2.44e+18,'GeV'],
    ['Electron Mass',0.51,'MeV'],
    ['Proton Mass',0.93827,'GeV'],
    //['Deuteron mass',1875.61,'MeV'],
    //['W Mass',80.43,'GeV'],
    ['Z Mass',91.19,'GeV'],
    ['Higgs vev (electroweak scale)',246.2,'GeV'],
    ['GUT Scale',1.00E+016,'GeV'],
    ['Electron Radius',2.82E-15,'m'],
    ['Compton Wavelength',3.86E-13,'m'],
    ['Bohr Radius',5.29E-11,'m'],
    //['parsec',3.09E+16,'m'],
    //['Year',3.16E+07,'s'],
    //['sidereal year (fixed star)',31558149.8,'s'],
    ['Hubble Length',1.20E+26,'m'],
    ['Solar Mass',1.99E+30,'Kg'],
    ['Solar Radius',6.96E+08,'m'],
    //['Solar Luminosity',3.85E+26,'W'],
    ['Sun Schwarzschild radius',2.95,'km'],
    ['Earth Mass',5.97E+24,'Kg'],
    ['Earth Radius',6380,'km'],
    ['Earth Sun Distance (au)',1.50E+11,'m'],
    ['Earth Moon Distance',3.84400000E+08,'m'],
    ['Earth Schwarzschild radius',8.87,'mm'],
    //['Radius of white dwarf with solar mass',5000,'km'],  // Too close to earth radius
    //['Radius of neutron star with solar mass',10,'km'],  // Too close to Height of Everest
    ['Moon Mass',7.35E+22,'Kg'],  // earth = 81.3 moons
    ['Jupiter Mass',1.90E+27,'Kg'],
    ['Jupiter Distance',7.79E+11,'m'],
    ['Nearest star (Proxima Centauri) Distance',4,'ly'],
    ['Galactic Center to Sun',8.05,'kpc'],
    ['Galactic disk of Milky Way Diameter',100000,'ly'],  // 33.3 kpc
    //['SN 1987A and LMC Distance',50,'kpc'],  // Too close to Galaxy Diameter
    ['Andromeda (nearest) Galaxy Distance',725,'kpc'],
    ['Local Group of galaxies Diameter',1.6,'Mpc'],
    ['Virgo cluster of galaxies Distance',14,'Mpc'],
    ['Local Supercluster Diameter',60,'Mpc'],
    //['Distance to certain quasars',1.0E+26,'m'],  // Too close to Hubble length
    //['Chandrasakhar (white dwarf limit)',1.5,'M_sun'],
    //['Oppenheimer-Volkov (neutron star limit)',2.0,'M_sun'],
    ['Visible Mass in Galaxy',2.00E+11,'M_sun'],
    ['All Mass in Galaxy',6.00E+11,'M_sun'],
    ['Black hole at center of our galaxy', 5.2e36, 'Kg'], // Taylor & Wheeler
    ['Black hole in center of Virgo cluster', 6e39, 'Kg'], // Taylor & Wheeler
    ['Mass in Universe',2.06E+55,'g'],
    ['Age of Universe',13.7,'Gyr'],
    //['Critical Density per cm^3',9.5E-30,'g'],  // These are all too close to Cosmological Constant
    //['Critical Density',9.5E-30,'g/cm^3'],
    //['Critical Density',5.3,'GeV/m^3'],
    //['Critical Density',2.55,'meV'],
    ['Cosmological Constant (Vac Energy)',1.86,'meV'],
    ['CMB Temperature',2.7,'K'],
    //['Sky Brightness Temp (Synchrotron)',200,'K'],
    ['Room Temperature',300,'K'],
    //['Earth Highest Temperature',58+273.15,'K'],
    //['Earth Lowest Temperature',89.2+273.15,'K'],
    //['Boiling',373.15,'K'],   // Boiling and freezing are too close
    //['Freezing Water',273.15,'K'],
    //['Neutrino Temp',1.9,'K'],
    ['Tallest Building height',508.0,'m'],
    ['Tallest Building mass',700000000,'Kg'],
    
    //['Lowest temp reached',2.17e-8,'K'], //3.0E-31,'J'], 
    //['Lowest temp for nuclear magnetic ordering', 100e-12,'K'], //3.0E-31,'J'],  //  at Helsinki
    //['KE of molecule at room temp',4.4E-21,'J'],
    ['Lowest temp for helium dilution fridge', 1.7e-3,'K'], //3.0E-31,'J'], 
    //['Boiling point of bound helium', 4.22, 'K'],  // Too close to CMB
    //['Temp on Pluto', 44, 'K'],  // Too close to liquid nitrogen temp
    ['Liquid Nitrogen temp', 77.35, 'K'],
    //['Melting point of tungsten', 3683, 'K'],  // Too close to Sun surface temp
    ['Temp in supernova explosions', 10e9, 'K'],
    ['Temperature on Venus', 737, 'K'],
    //['Melting point of aluminum', 933.47, 'K'],  // Too close to temp of Venus
    
    
    ['Neutrino mass upper bound',50,'eV'],
    ['Fission of one U-235',200,'MeV'],
    ['Flying mosquito kinetic energy',1.0001,'TeV'],
    ['LHC p-p collisions',15,'TeV'],
    ['LHC Pb-Pb collisions',1250,'TeV'],
    ['GZK limit for energy of a cosmic ray', 5e19, 'eV'],
    ['Most energetic cosmic ray ever detected',3.0E+20,'eV'],
    //['Average person using a baseball bat', 80, 'J'],  // Too close to most energetic cosmic ray
    ['Bullet Kinetic Energy (AK74 at 900 m/s)', 14203,'J'],
    ['Energy in 1g of sugar or protein', 3.8e4, 'J'],
    ['Car Kinetic Energy',3.0E+05,'J'],
    //['typical serving of staple food', 1e6, 'J'], // Close to GUT Scale
    ['Food energy a human consumes in a day',8.4E+06,'J'],  // 2000 Kcal
    //['Exploding 1Kg of TNT',4.184e+06,'J'],  // To close to Food energy a human consumes and NIF laser
    ['Lightning bolt energy',1.5E+09,'J'],
    ['Exploding 1 ton of TNT',4.184e9,'J'],
    ['Largest conventional bomb (MOAB)',4.184e9*11,'J'], // http://en.wikipedia.org/wiki/MOAB
    ['Largest conventional bomb test (600 ton TNT)',4.184e9*600,'J'],  // http://www.washingtonpost.com/wp-dyn/content/article/2006/03/30/AR2006033001735.html
    ['Hiroshima blast',4.2E+06*1000*13000,'J'], // http://en.wikipedia.org/wiki/MOAB
    ['Largest nuclear weapon tested energy',2.5E+17,'J'],
    ['Energy consumed by the world in one year (2001)',4.3E+20,'J'],
    ["Energy in world's fossil fuel reserves (2003)",3.9E+22,'J'],
    ['Energy output of the Sun in one second',3.8E+26,'J'],
    ['Energy output of the Sun in one year',3.8E+26*31556926,'J'],
    ["Energy in world's U-238 reserves (2003)",3.0E+31,'J'],
    ['Earth gravitational binding energy',2.4E+32,'J'],
    ['Sun gravitational binding energy',6.9E+41,'J'],
    ['Energy released in a gamma ray burst',1.0E+47,'J'],
    
    ['Gamma Rays',1.001,'pm'],
    ['X-Rays',100,'pm'],
    //['Visible Light',400,'nm'],
    ['Violet Light',400,'nm'],
    ['Red Light',750,'nm'],
    //['hc=1240 nm eV',1240,'nm'],  // Just a check to make sure 1240nm lines up with 1eV
    ['DNA helix diameter',2,'nm'],
    ['HIV (average size) virus size',90,'nm'],
    ['Bacteria diameter',3.2,'um'],
    ['Blood cell / Spider web / Eukaryotic nucleus',7,'um'],
    ['Human Hair width',80,'um'],
    ['Height of Everest',8.848,'km'],
    //['Mean depth of Ocean', 3.600, 'km'],
    //['deepest ocean trench',10.911,'km'],
    ['Height of Olympus Mons on Mars', 27.000, 'km'],
    ['Geosynch Orbit Distance', 3.6e7, 'm'],
    //['length of the Great Wall of China',6.4e6,'m'],  // Same as Earth Radius and not sure if it's right
    ['Lead-208 atom mass',3.5E-25,'Kg'],
    ['Small virus mass',1.0E-20,'Kg'],
    ['E. coli bacterium mass',7.0E-16,'Kg'],
    ['Avg. human cell mass',1.0E-12,'Kg'],
    ['Mosquito mass',1.5E-03,'g'],
    ['Blue whale mass',1.0E+05,'Kg'],
    ['Human mass',100,'Kg'],
    ['Titanic mass',2.6E+07,'Kg'],
    ["Earth's oceans mass",1.4E+21,'Kg'],
    ['Virgo Supercluster mass',2.0E+46,'Kg'],
    //['Time left for Sun',9,'Gyr'],
    ['WiFi and Microwave ovens', 2.4, 'GHz'],
    ['FM Radio and TV', 100, 'MHz'],
    ['AM Radio', 1.0001, 'MHz'],
    ['Human Hearing upper limit', 20, 'kHz'],
    ['Human Hearing lower limit', 20, 'Hz'],
    ['Density of Water', 1.0001, 'g/cm^3'],
    ['Hydrogen hyperfine splitting of spins', 21, 'cm'],
    ['Sun surface temp', 5785, 'K'],
    ['Sun core temp', 13.6, 'MK'],
    ['Local Disk Density', 1.0001e-23, 'g/cm^3'],
    ['Local Halo Density', 1.0001e-24, 'g/cm^3'],
    ['Age of Earth, Sun, and Life', 4.5, 'Gyr'],
    //['Age of Life on Earth', 4, 'Gyr'],
    //['Age of Cells on Earth', 3.5, 'Gyr'],
    //['Age of Photosynthesis on Earth', 3, 'Gyr'],
    ['Age of Eukaryotic cells on Earth', 2, 'Gyr'],
    ['Age of Multicellular life on Earth', 1.00001, 'Gyr'],
    ['Age of Life on Land', 500, 'Myr'],
    ['Age of Dinosaur Extinction', 65, 'Myr'],
    //['Age of genus Homo', 2, 'Myr'],
    ['Age of control of fire', 1.0001, 'Myr'],
    ['Age of Homo sapiens', 200, 'kyr'],
    //['Age of Humans living on all continents', 11, 'kyr'],
    //['Age of Agriculture', 8000, 'yr'],
    ['Age of Civilization', 6000, 'yr'],
    //['Age of Space Flight', 50, 'yr'],
    ['Lifespan of Person', 100, 'yr'],
    //['Energy to switch transistor', 1, 'J'],  // 1/2 C V^2
    ['Energy of biggest laser pulse @ NIF 1ns (check)', 3e6, 'J'],  // Too close to 
    ['Energy of a well-hit tennis ball (check)', 1e20, 'eV'],
    // Energy release in a nova, supernovae, hypernovae
    // Tidal energy delivered to earth in one moon orbit
    // K-T impact that wiped out the dinosaurs
    ['Transistor channel length (2007)', 45, 'nm'],
    ['Energy released to the collapse to a neutron star', 1e55, 'erg'],  // SN is collapse to white dwarf
    //['Energy used by a human in a lifetime', // 1-10 kW continuous
    // Energy used by the world in a year
    ['Supernova 1A temp (lasts seconds)', 1e6, 'K'],
    ['Supernova 1A energy released', 1e46, 'J'],
    // Time for cosmic inflation
    ['Time for sun to orbit galaxy (cosmic year)', 226e6, 'yr'],
    // Hawking temperature of BH the size of the sun OR Size of BH whose hawking temp is same as sun
    // Kardeschev civilization categories (type 0, type 1, etc.)
    ['Energy in reactions in sun', 1.0001, 'keV'],
    ['Energy in reactions in red giants', 100, 'keV'],
    ['Energy in reactions in Supernovae', 50, 'MeV']
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
        data[i][3] = pl_masses
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
        p.strokeStyle = 'rgba(0.5,0.5,0.5,0.1)'
        //p.strokeStyle = 'rgba(0.1,0.1,0.1,1.0)'
        p.currentGroup = p.view.element
        p.fontSize = 7
        p.fontWeight = null
        p.textAnchor = null
        //var offset = 0
        forEach(data, function(item) {
            var name = item[0]
            var value = item[1]
            var unit = item[2]
            var pl_masses = item[3]
            var type = whichType(unit)
            if ( name.search('ass') > -1 && unit.search('eV') > -1 )
                type = 'Mass'
            var index = displayCategories.indexOf(type)
            if (index > -1) {
                p.beginPath()
                var j = p.view.ytoj(pl_masses)
                p.moveTo(smallest_location-15, j)
                p.lineTo(width, j)
                p.stroke()
                var text
                if (value == 1)
                    text = name
                else if (value >= .0001 && value <= 9999)
                    text = name + '  (' + parseFloat(value.toPrecision(2)) + ' ' + unit + ')'
                else {
                    text = name + '  (' + value.toPrecision(2) + ' ' + unit + ')'
                }
                // Put label 10 pixels away from the nearest axis
                p.text(text, 10+index*width/displayCategories.length, j)
            }
        })
    }
    
    var makesource = function() {
        var form = FORM( { name:'form', method:'post', action:'http://brainflux.org/cgi-bin/convert_svg.py'}, 
                       svgSrcArea=TEXTAREA({rows:'14', cols:'60', wrap:'off', name:'source'} , p.svg.toXML() ),
                       BR(null),
                       buttonSVG=INPUT({type:'submit', name:'type', value:'svg'}), ' ',
                       buttonPDF=INPUT({type:'submit', name:'type', value:'pdf'}), ' ',
                       buttonPNG=INPUT({type:'submit', name:'type', value:'png'}), ' ',
                       buttonJPEG=INPUT({type:'submit', name:'type', value:'jpg'}) )
        
        appendChildNodes('form_div', form)
    }
    
    p.svg.whenReady(doit)
    p.svg.whenReady(makesource)
}

addLoadEvent(units);
