import React from 'react';

const TeamManagement: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#cfe7d1] dark:border-[#2a3d2c] rounded-xl bg-background-light/50 dark:bg-[#152a17]/50">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">engineering</span>
            </div>
            <h3 className="text-xl font-bold text-[#0d1b0f] dark:text-white">Team Management</h3>
            <p className="text-[#4c9a52]">Assign installers and manage team schedules.</p>
            <button className="mt-4 px-6 py-2 bg-primary text-forest font-bold rounded-lg hover:brightness-105">
                Add Installer
            </button>
        </div>
    );
};

export default TeamManagement;
