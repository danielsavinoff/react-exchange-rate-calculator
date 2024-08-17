import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/combobox'
import { getCurrencySymbol } from '@/utils/getCurrencySymbol'
import { useQuery } from 'react-query'
import axios, { AxiosResponse } from 'axios'
import { LoaderIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

const currencies = Intl.supportedValuesOf("currency").map(currencyCode => ({
  label: currencyCode,
  value: currencyCode 
}))

function App() {
  const [convertable, setConvertable] = useState<string | undefined>('EUR')
  const [converted, setConverted] = useState<string | undefined>('USD')

  const [convertableValue, setConvertableValue] = useState<number | undefined>()
  const [convertedValue, setConvertedValue] = useState<number | undefined>()

  const { data, isError, isLoading } = useQuery({
    queryKey: ['rates'],
    queryFn: async () => axios.get(`https://api.exchangeratesapi.io/v1/latest?access_key=${import.meta.env.VITE_API_KEY}`) as Promise<AxiosResponse<{ rates: Record<string, number> }>>
  })

  useEffect(() => {
    if (typeof convertableValue === 'number' && !isError) {
      setConvertedValue((convertableValue / data?.data.rates[convertable as string]!) * data?.data.rates[converted as string]!)
    }
  }, [convertable, converted, convertableValue])

  useEffect(() => {
    if (typeof convertedValue === 'number' && !isError) {
      setConvertableValue((convertedValue / data?.data.rates[converted as string]!) * data?.data.rates[convertable as string]!)
    }
  }, [convertedValue])

  if (isError) return(
    <div className="min-h-dvh flex items-center">
      <div className="max-w-80 full mx-auto">
        <Alert variant="default">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            An unexpected error happened.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )

  if (isLoading) return(
    <div className="min-h-dvh flex items-center">
      <LoaderIcon className='mx-auto h-4 w-4 animate-spin' />
    </div>
  )

  return (
    <div className="min-h-dvh flex items-center px-4">
      <div className="max-w-80 w-full mx-auto space-y-8">
        <h1 className='font-bold text-3xl text-center'>Exchange rates</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input 
              className='h-11 pr-0 [&:has(input:focus-visible)]:ring-1 [&:has(input:focus-visible)]:ring-ring'
              asChild
            >
              <div className='flex items-center'>
                <input 
                  className='flex-1 bg-transparent focus:outline-none'
                  type='number'
                  placeholder='Enter a number'
                  value={convertableValue}
                  onChange={e => setConvertableValue(parseFloat(e.target.value))}
                />
                <div className="w-[1px] h-4/6 border-l" />
                <div className="px-1">
                  <Combobox
                    data={currencies}
                    defaultValue={convertable}
                    onValueChange={(value) => setConvertable(value)}
                    className='shrink-0 px-2 text-muted-foreground'
                  />
                </div>
              </div>
            </Input>
            <Input 
              className='h-11 pr-0 [&:has(input:focus-visible)]:ring-1 [&:has(input:focus-visible)]:ring-ring'
              asChild
            >
              <div className='flex items-center'>
                <input 
                  className='flex-1 bg-transparent focus:outline-none'
                  type='number'
                  pattern='[0-9]'
                  placeholder='Enter a number'
                  value={convertedValue}
                  onChange={e => setConvertedValue(parseFloat(e.target.value))}
                />
                <div className="w-[1px] h-4/6 border-l" />
                <div className="px-1">
                  <Combobox
                    data={currencies}
                    defaultValue={converted}
                    onValueChange={(value) => setConverted(value)}
                    className='shrink-0 px-2 text-muted-foreground'
                  />
                </div>
              </div>
            </Input>
          </div>
          <div className="w-11/12 mx-auto">
            <p className='text-center text-sm text-muted-foreground'>
              Choose a currency and enter value to get the latest information
            </p>
          </div>
          <hr />
          <div className="flex">
            <p className='font-medium text-sm'>Rate</p>
            <p className='ml-auto font-medium text-sm'>
              1 {getCurrencySymbol(convertable as string)} ≈ {(1 / data?.data.rates[convertable as string]!) * data?.data.rates[converted as string]!} {getCurrencySymbol(converted as string)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App