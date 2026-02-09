import React from 'react';
import type { JobOffer as JobOfferType } from '../../data/jobs';
import { Card } from './Card';
import { Button } from './Button';
import { BriefcaseIcon, MapPinIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface JobOfferProps {
  job: JobOfferType;
  onApply?: (jobId: number) => void;
}

export const JobOffer: React.FC<JobOfferProps> = ({ job, onApply }) => {
  return (
    <Card className="p-6 hover:border-[#1067a8]/20 transition-colors duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-sm text-[#1067a8]">{job.department}</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-[#1067a8]/10 text-[#1067a8] px-3 py-1 rounded-full">
          <BriefcaseIcon className="w-4 h-4" />
          <span>{job.type}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <AcademicCapIcon className="w-4 h-4 text-gray-400" />
          <span>{job.experience}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <span>Posté le {job.postedDate}</span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>

      <div className="space-y-3 mb-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">Requiert:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {job.requirements.slice(0, 3).map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-[#1067a8] mt-1">•</span>
                <span>{req}</span>
              </li>
            ))}
            {job.requirements.length > 3 && (
              <li className="text-sm text-gray-400">
                ... et {job.requirements.length - 3} autres
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm font-medium text-gray-900">
          {job.salary}
        </div>
        <Button 
          size="sm"
          onClick={() => onApply?.(job.id)}
        >
          Postuler
        </Button>
      </div>
    </Card>
  );
};
