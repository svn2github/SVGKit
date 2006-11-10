var units = function() {
    var c = 299792458 // m/s
    var h = 6.626069311E-34 // J*s
    var hbar = h / (2.0 * Math.PI)
    var eV = 1.6021765314E-19 // J
    var Gn = 6.67421e-11 // N m^2 / Kg^2
    var kb = 1.380650524E-23 // J/K

    // http://en.wikipedia.org/wiki/Planck_units
    var planck_length = Math.sqrt(hbar * Gn / (c*c*c) )  // 1.61624e-35 m
    var planck_mass = Math.sqrt(hbar * c / Gn)           // 2.17645e-8 kg
    var planck_time = planck_length / c                   // 5.39121e-44 s
    var planck_temp = planck_mass * c * c / kb           // 1.41679e32 K
    var planck_momentum = hbar / planck_length           //     6.52485 kg m/s
    var planck_energy = planck_mass * c * c              //    1.9561e9 J
    var planck_force = planck_energy / planck_length    // 1.21027e44 N
    var planck_power = planck_energy / planck_time     //     3.62831e52 W
    var planck_area = planck_length * planck_length
    var planck_volume = planck_area*planck_length
    var planck_density = planck_mass / planck_volume  // 5.15500e96 kg/m3
    var planck_angular_freq = 1.0 / planck_time      // 1.85487e43 s-1
    var planck_pressure = planck_force / planck_area // 4.63309e113 Pa

    var units = {}
    // 'planck' category says how many planck units are there in the given unit
    // Time
    units['s'] = {dim:-1, planck: 1/planck_time }
    units['ms'] = {dim:-1, planck: 1/planck_time/1e3 }
    units['us'] = {dim:-1, planck: 1/planck_time/1e6 }
    units['ns'] = {dim:-1, planck: 1/planck_time/1e9 }
    units['min'] = {dim:-1, planck: units['s']['planck']*60 }
    units['hr'] = {dim:-1, planck: units['min']['planck']*60 }
    units['day'] = {dim:-1, planck: units['hr']['planck']*24 }
    units['mo'] = {dim:-1, planck: units['day']['planck']*30 }
    units['yr'] = {dim:-1, planck: units['s']['planck']*31556926 }
    units['Gyr'] = {dim:-1, planck: units['yr']['planck']*1e9 }
    // Distance
    units['m'] = {dim:-1, planck: 1/planck_length }
    units['cm'] = {dim:-1, planck:  1/planck_length/1e2 }
    units['mm'] = {dim:-1, planck:  1/planck_length/1e3 }
    units['um'] = {dim:-1, planck:  1/planck_length/1e6 }
    units['nm'] = {dim:-1, planck:  1/planck_length/1e9 }
    units['pm'] = {dim:-1, planck:  1/planck_length/1e12 }
    units['A'] = {dim:-1, planck:  1/planck_length/1e10 }
    units['ly'] = {dim:-1, planck:  1/planck_length*9.4605284e15 }
    units['pc'] = {dim:-1, planck:  1/planck_length*3.08568025e16  }
    units['kpc'] = {dim:-1, planck:  units['pc']['planck']*1e3 }
    units['Mpc'] = {dim:-1, planck:  units['pc']['planck']*1e6 }
    // Mass
    units['Kg'] = {dim:1, planck: 1/planck_mass }
    units['g'] = {dim:1, planck: 1/planck_mass / 1000 }
    units['M_sun'] = {dim:1, planck: 1/planck_mass * 1.988443E+30 }
    units['M_pl'] = {dim:1, planck: 1 }
    // Energy
    units['J'] = {dim:1, planck: 1/planck_energy }
    units['eV'] = {dim:1, planck: 1/planck_energy * eV }
    units['keV'] = {dim:1, planck: units['eV']['planck']*1e3 }
    units['MeV'] = {dim:1, planck: units['eV']['planck']*1e6 }
    units['GeV'] = {dim:1, planck: units['eV']['planck']*1e9 }
    units['TeV'] = {dim:1, planck: units['eV']['planck']*1e12 }
    // Power
    units['W'] = {dim:2, planck: 1/planck_power }
    // Temp
    units['K'] = {dim:1, planck: 1/planck_temp }
    // Density
    units['g/cm^3'] = {dim:4, planck: units['g']['planck'] / 
                                        Math.pow(units['cm']['planck'],3)}
    
    //var displayUnits = ['s', 'yr', 'm', 'ly', 'Kg', 'J', 'eV', 'GeV', 'K', 'M_pl']
    var displayUnits = ['J', 'GeV', 'M_pl']
    
    // Find: (".*")
    // Replace: [\1],
    var data = [
    ["1s",1,"s"],
    ["1m",1,"m"],
    ["1cm",1,"cm"],
    ["1mm",1,"mm"],
    ["1J",1,"J"],
    ["1Kg",1,"Kg"],
    ["1g",1,"g"],
    ["1K",1,"K"],
    ["1eV",1,"eV"],
    ["1u",1.66054021E-027,"Kg"],
    ["Gravitational Constant",1.22089836113838E+019,"GeV"],
    ["Reduced Planck Mass",2.44E+018,"GeV"],
    ["Electron Mass",0.51,"MeV"],
    ["Proton Mass",938.27,"MeV"],
    ["deuteron mass",1875.61,"MeV"],
    ["W Mass",80.43,"GeV"],
    ["Z Mass",91.19,"GeV"],
    ["GUT Scale",1.00E+016,"GeV"],
    ["Electron Radius",2.82E-15,"m"],
    ["Compton Wavelength",3.86E-13,"m"],
    ["Bohr Radius",5.29E-11,"m"],
    ["parsec",3.09E+16,"m"],
    ["tropical year (equinox)",3.16E+07,"s"],
    ["sidereal year (fixed star)",31558149.8,"s"],
    ["Hubble Length",1.20E+26,"m"],
    ["Solar Mass",1.99E+30,"Kg"],
    ["Solar Radius",6.96E+08,"m"],
    ["Solar Luminosity",3.85E+26,"W"],
    ["Sun Schwarzschild radius",2.95E+03,"m"],
    ["Earth Mass",5.97E+24,"Kg"],
    ["Earth Radius",6.38E+06,"m"],
    ["Earth Sun Distance",1.50E+13,"m"],
    ["Earth Moon Distance",384400000,"m"],
    ["Earth Schwarzschild radius",8.87E-03,"m"],
    ["Moon Mass",7.35E+22,"Kg"],
    ["Jupiter Mass",1.90E+27,"Kg"],
    ["Jupiter Distance",7.79E+11,"m"],
    ["Andromeda (nearest) Dist",2.00E+06,"ly"],
    ["Visible Mass in Galaxy",2.00E+11,"M_sun"],
    ["All Mass in Galaxy",6.00E+11,"M_sun"],
    ["Galactic Center to Sun",8.05,"kpc"],
    ["Age of Universe",13.7,"Gyr"],
    ["Critical Density per cm^3",9.5E-30,"g"],
    /*["Critical Density",4.51E-36,"g/cm^3"],*/
    ["Mass in Universe",2.06E+55,"g"],
    ["Cosmological Constant",1.8,"MeV"],
    ["CMB Temperature",2.7,"K"],
    ["Neutrino Temp",1.9,"K"],
    ["Tallest Build height",508.0,"m"],
    ["Tallest Build weight",700000000,"Kg"],
    ["Lowst temp reached",3.0E-31,"J"],
    ["KE of molecule at room temp",4.4E-21,"J"],
    ["bound on neutrino mass",50,"eV"],
    ["fission of one U-235",200,"MeV"],
    ["kinetic energy of a flying mosquito",1,"TeV"],
    ["LHC p-p collisions",15,"TeV"],
    ["LHC Pb-Pb collisions",1250,"TeV"],
    ["most energetic cosmic ray ever detected",3.0E+20,"eV"],
    ["KE of bullet",2.0E+03,"J"],
    ["KE of car",3.0E+05,"J"],
    ["exploding 1Kg of TNT",4.2E+06,"J"],
    ["2000 kcal diet (one day)",8.4E+06,"J"],
    ["energy in an average lightning bolt",1.5E+09,"J"],
    ["energy release of the largest nuclear weapon ever tested",2.5E+17,"J"],
    ["energy consumed by the world in one year (2001)",4.3E+20,"J"],
    ["energy in world's estimated total fossil fuel reserves (2003)",3.9E+22,"J"],
    ["energy output of the Sun in one second",3.8E+26,"J"],
    ["energy in world's estimated recoverable U-238 reserves (2003)",3.0E+31,"J"],
    ["gravitational binding energy of the earth",2.4E+32,"J"],
    ["gravitational binding energy of the Sun",6.9E+41,"J"],
    ["The energy released in a gamma ray burst",1.0E+47,"J"],
    ["gamma rays",1,"pm"],
    ["x-rays",100,"pm"],
    ["Visible Light",500,"nm"],
    ["diameter of DNA helix",2,"nm"],
    ["HIV (average size) virus",90,"nm"],
    ["diameter of typical bacterium",3.2,"um"],
    ["blood cell / spider web / eukariotic nucleus",7,"um"],
    ["average width of human hair",80,"um"],
    ["Height of Everest",8848,"m"],
    ["deepest ocean trench",10911,"m"],
    ["length of the Great Wall of China",6400000,"m"],
    ["distance to nearest star (Proxima Centauri)",4,"ly"],
    ["diameter of galactic disk of Milky Way Galaxy",100000,"ly"],
    ["distance to SN 1987A and LMC",50,"kpc"],
    ["distance to Andromeda Galaxy",725,"kpc"],
    ["diameter of Local Group of galaxies",1.6,"Mpc"],
    ["distance to Virgo cluster of galaxies",14,"Mpc"],
    ["diameter of the Local Supercluster",60,"Mpc"],
    ["estimated distance to certain quasars",1.0E+26,"m"],
    ["mass of Lead-208 atom",3.5E-25,"Kg"],
    ["mass of small virus",1.0E-20,"Kg"],
    ["mass of E. coli bacterium",7.0E-16,"Kg"],
    ["mass of avg. human cell",1.0E-12,"Kg"],
    ["mass of a mosquito",1.5E-06,"Kg"],
    ["mass of blue whale",1.0E+05,"Kg"],
    ["mass of human",1.0E+02,"Kg"],
    ["mass of Titanic",2.6E+07,"Kg"],
    ["mass of Earth's oceans",1.4E+21,"Kg"],
    ["mass of Virgo Supercluster",2.0E+46,"Kg"],
    ["Time left for Sun",9,"Gyr"],
    ["Sky Brightness (Synchrotron)",200,"K"]
    ]

    var tbody = $('fundamental_units_body')
    var GeVs = []
    var Mpls = []
    for (var i=0; i<data.length; i++)
    {
        var name = data[i][0]
        var value = data[i][1]
        var unit = data[i][2]
        var pl_units = value*units[unit].planck  // A time is now in units of planck_time
        var pl_masses = Math.pow(pl_units,units[unit].dim)
        data[i][3] = pl_masses
        var gev = pl_masses / units['GeV'].planck
        Mpls.push(pl_masses)
        GeVs.push(gev)
        //log(name, value, unit, 'pl_units=', pl_units, 'pl_masses=', pl_masses, 'GeV=', gev)
        
        var scientificNotation = function(num, digits) {
            var log10 = Math.log(num)/Math.LN10
            var exp = Math.floor(log10)
            var base = num / Math.pow(10, exp)
            var base_str = base.toPrecision(digits)
            return base_str + 'e' + exp
        }
        
        var tr = TR(null, TD(null, name),
                           TD(null, value),
                           TD(null, unit),
                           TD(null, scientificNotation(pl_units,2)),
                           TD(null, scientificNotation(pl_masses,2)),
                           TD(null, scientificNotation(gev,2)) )
        appendChildNodes(tbody, tr)
    }
    

    var p = new SVGPlot(1400,1200)
    replaceChildNodes('fundamental_units_div', p.svg.htmlElement)
    var doit = function() {
        var sortNumber = function(a,b) {
            return a - b
        }
        GeVs.sort(sortNumber)
        Mpls.sort(sortNumber)
        
        p.addBox()
        
        var loground = function(num, direction) {
            var log10 = Math.log(num)/Math.LN10
            if (direction<0)
                log10 = Math.floor(log10)
            if (direction>0)
                log10 = Math.ceil(log10)
            return Math.pow(10, log10)
        }
        
        var everyNDecade = function(bottom, top, n) {
            // n can be positive to go up and negative to go down
            var decades = []
            for (var x = bottom; x < top; x *= Math.pow(10, n)) {
                decades.push(x)
            }
            return decades
        }
        
        var min_mpl = loground(Mpls[0], -1)
        var max_mpl = loground(Mpls[Mpls.length-1], 1)
        p.addView()
        p.setXScale(-1, Mpls.length+1)
        p.setYScale(min_mpl, max_mpl)
        p.yScale.interpolation = 'log'
        p.logplot(Mpls)
        
        // Add all of the axes
        forEach(displayUnits, function(unit) {
            var dim = units[unit].dim
            var planck = units[unit].planck
            
            var bottom = Math.pow(min_mpl/planck, dim)
            var top = Math.pow(max_mpl/planck, dim)

            var bottom_round = loground(bottom, -dim)
            var top_round = loground(top, dim)
            
            var decades = everyNDecade(bottom_round, top_round, dim)
            var convertToMpl = function(x) {
                return Math.pow(x*planck, dim)
            }
            var locations = map(convertToMpl, decades);
            
            
            var decades3 = everyNDecade(bottom_round, top_round, 3*dim)
            var locations3 = map(convertToMpl, decades3);
            
            var scientific2 = function(num) {
                //return scientificNotation(num, 2)
                var log10 = Math.log(num)/Math.LN10
                var exp = Math.floor(log10)
                return exp
            }
            var decades3_sci = map(scientific2, decades3);
            
            p.addYAxis('left')
            p.addYTicks(locations, 'left')
            p.addYTickLabels(locations3, decades3_sci, 'left')
        })
        
        // Draw Horizontal Lines for the data points
        p.render()
    }
    p.svg.whenReady(doit)
}

addLoadEvent(units);
