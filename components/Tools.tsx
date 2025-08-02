import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calculator, DollarSign, Weight, Ruler, Droplets } from 'lucide-react';

export function Tools() {
  // Currency Converter State
  const [currencyFrom, setCurrencyFrom] = useState('USD');
  const [currencyTo, setCurrencyTo] = useState('EUR');
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [currencyResult, setCurrencyResult] = useState('');

  // Weight Converter State
  const [weightFrom, setWeightFrom] = useState('kg');
  const [weightTo, setWeightTo] = useState('lbs');
  const [weightAmount, setWeightAmount] = useState('');
  const [weightResult, setWeightResult] = useState('');

  // Distance Converter State
  const [distanceFrom, setDistanceFrom] = useState('km');
  const [distanceTo, setDistanceTo] = useState('miles');
  const [distanceAmount, setDistanceAmount] = useState('');
  const [distanceResult, setDistanceResult] = useState('');

  // Liquid Converter State
  const [liquidFrom, setLiquidFrom] = useState('liters');
  const [liquidTo, setLiquidTo] = useState('gallons');
  const [liquidAmount, setLiquidAmount] = useState('');
  const [liquidResult, setLiquidResult] = useState('');

  // Currency rates (in a real app, this would come from an API)
  const currencyRates: { [key: string]: number } = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110,
    CAD: 1.25,
    AUD: 1.35,
    CHF: 0.92,
    CNY: 6.45
  };

  const currencies = Object.keys(currencyRates);

  // Weight conversions (to grams)
  const weightConversions: { [key: string]: number } = {
    g: 1,
    kg: 1000,
    lbs: 453.592,
    oz: 28.3495,
    stone: 6350.29
  };

  const weightUnits = Object.keys(weightConversions);

  // Distance conversions (to meters)
  const distanceConversions: { [key: string]: number } = {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    miles: 1609.34
  };

  const distanceUnits = Object.keys(distanceConversions);

  // Liquid conversions (to milliliters)
  const liquidConversions: { [key: string]: number } = {
    ml: 1,
    liters: 1000,
    gallons: 3785.41,
    quarts: 946.353,
    pints: 473.176,
    cups: 236.588,
    'fl oz': 29.5735
  };

  const liquidUnits = Object.keys(liquidConversions);

  const convertCurrency = () => {
    if (!currencyAmount) return;
    const amount = parseFloat(currencyAmount);
    const fromRate = currencyRates[currencyFrom];
    const toRate = currencyRates[currencyTo];
    const result = (amount / fromRate) * toRate;
    setCurrencyResult(result.toFixed(2));
  };

  const convertWeight = () => {
    if (!weightAmount) return;
    const amount = parseFloat(weightAmount);
    const fromRate = weightConversions[weightFrom];
    const toRate = weightConversions[weightTo];
    const result = (amount * fromRate) / toRate;
    setWeightResult(result.toFixed(4));
  };

  const convertDistance = () => {
    if (!distanceAmount) return;
    const amount = parseFloat(distanceAmount);
    const fromRate = distanceConversions[distanceFrom];
    const toRate = distanceConversions[distanceTo];
    const result = (amount * fromRate) / toRate;
    setDistanceResult(result.toFixed(4));
  };

  const convertLiquid = () => {
    if (!liquidAmount) return;
    const amount = parseFloat(liquidAmount);
    const fromRate = liquidConversions[liquidFrom];
    const toRate = liquidConversions[liquidTo];
    const result = (amount * fromRate) / toRate;
    setLiquidResult(result.toFixed(4));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Converter Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="currency" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="currency" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Currency</span>
              </TabsTrigger>
              <TabsTrigger value="weight" className="flex items-center gap-1">
                <Weight className="h-4 w-4" />
                <span className="hidden sm:inline">Weight</span>
              </TabsTrigger>
              <TabsTrigger value="distance" className="flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                <span className="hidden sm:inline">Distance</span>
              </TabsTrigger>
              <TabsTrigger value="liquid" className="flex items-center gap-1">
                <Droplets className="h-4 w-4" />
                <span className="hidden sm:inline">Liquid</span>
              </TabsTrigger>
            </TabsList>

            {/* Currency Converter */}
            <TabsContent value="currency" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={currencyAmount}
                      onChange={(e) => setCurrencyAmount(e.target.value)}
                    />
                    <Select value={currencyFrom} onValueChange={setCurrencyFrom}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Result"
                      value={currencyResult}
                      readOnly
                      className="bg-muted"
                    />
                    <Select value={currencyTo} onValueChange={setCurrencyTo}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={convertCurrency} className="w-full">
                Convert Currency
              </Button>
              <p className="text-xs text-muted-foreground">
                * Exchange rates are approximate and for demonstration purposes
              </p>
            </TabsContent>

            {/* Weight Converter */}
            <TabsContent value="weight" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={weightAmount}
                      onChange={(e) => setWeightAmount(e.target.value)}
                    />
                    <Select value={weightFrom} onValueChange={setWeightFrom}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weightUnits.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Result"
                      value={weightResult}
                      readOnly
                      className="bg-muted"
                    />
                    <Select value={weightTo} onValueChange={setWeightTo}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weightUnits.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={convertWeight} className="w-full">
                Convert Weight
              </Button>
            </TabsContent>

            {/* Distance Converter */}
            <TabsContent value="distance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={distanceAmount}
                      onChange={(e) => setDistanceAmount(e.target.value)}
                    />
                    <Select value={distanceFrom} onValueChange={setDistanceFrom}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {distanceUnits.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Result"
                      value={distanceResult}
                      readOnly
                      className="bg-muted"
                    />
                    <Select value={distanceTo} onValueChange={setDistanceTo}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {distanceUnits.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={convertDistance} className="w-full">
                Convert Distance
              </Button>
            </TabsContent>

            {/* Liquid Converter */}
            <TabsContent value="liquid" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={liquidAmount}
                      onChange={(e) => setLiquidAmount(e.target.value)}
                    />
                    <Select value={liquidFrom} onValueChange={setLiquidFrom}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {liquidUnits.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Result"
                      value={liquidResult}
                      readOnly
                      className="bg-muted"
                    />
                    <Select value={liquidTo} onValueChange={setLiquidTo}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {liquidUnits.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={convertLiquid} className="w-full">
                Convert Liquid
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}