import { Skeleton } from "@repo/ui";

export default function Loading() {
    return (
        <div className="w-full max-w-6xl mx-auto">
            <Skeleton className="h-10 w-1/3 mb-8 rounded-lg" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-96">
                    <Skeleton className="h-4 w-1/4 mb-4" />
                    <Skeleton className="h-12 w-1/2 mb-12" />
                    
                    <Skeleton className="h-6 w-1/3 mb-6" />
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                </div>

                <div className="col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center h-96">
                    <Skeleton className="h-6 w-2/3 mb-4" />
                    <Skeleton className="h-4 w-full mb-8" />
                    <Skeleton className="w-40 h-40 rounded-2xl mb-6" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
