import React from 'react';
import {QueryClient, QueryClientProvider, useQueryClient} from "@tanstack/react-query";
import { PaperProvider } from 'react-native-paper';

const queryClient = new QueryClient()

const Providers = ({ children }: { children: React.ReactNode }) => {
 

    return (
        <QueryClientProvider client={queryClient}>
            <PaperProvider>
                {children}
            </PaperProvider>
        </QueryClientProvider>
    );
};

export default Providers;