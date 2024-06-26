'use client';

import {ReactNode, useEffect, useState} from 'react';
import {GameToolProjectsList} from '@/src/data/GameToolsProjectsData';
import otherProjectsData from '@/src/data/OtherProjectsData';
import {ProjectCards} from './ProjectCards';
// eslint-disable-next-line n/no-extraneous-import
import {HiFilter} from 'react-icons/hi';
import {ProjectData, ProjectDataWithImages} from '@/src/data/ProjectDataTypes';
import {ProjectDataArrayEncrypted} from '@/src/data/ProjectDataArrayEncrypted';
import {projectTypeEnum} from '@/src/projectTypeEnum';
import ProjectModal from './ProjectModal';
import {Types} from './ProjectFilter';
import {projectType} from '../projectType';
import {ButtonGroup} from './ProjectToggle';
import GameProjectsData from '@/src/data/GameProjectsData';
import {Button, Drawer} from 'flowbite-react';

const cipherstring: Uint8Array = Uint8Array.from([
  140, 27, 0, 173, 96, 5, 158, 202, 36, 231, 212, 24, 62, 84, 117, 167,
]);
const filterStack: Set<string> = new Set<string>();
let output: Array<ProjectData> = [];
let projectTypeFilter: {
  [id: string]: projectType;
} = {
  game: {activated: true},
  gametools: {activated: true},
  otherProjects: {activated: true},
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const locale = '';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ProjectBrowser(props: {locale: string}): ReactNode {
  const [projectsData, setProjectsData] = useState<Array<ProjectData>>([]);
  const [projectData, setProjectData] = useState<ProjectData | undefined>(
    undefined
  );
  const [openModalStatus, setOpenModal] = useState(false);
  const [openFilterSidebar, setOpenFilterSidebar] = useState(false);

  // This is bad
  const [projectDataOriginal] =
    useState<Array<ProjectDataWithImages>>(GameProjectsData());
  const [GameToolsProjectsList] = useState<Array<ProjectData>>(
    GameToolProjectsList()
  );
  const [otherProjectsDataList] =
    useState<Array<ProjectData>>(otherProjectsData());
  // if (props.locale !== locale)
  // {

  //   setprojectDataOriginal(GameProjectsData(props.locale))
  //   locale = props.locale;
  // }

  useEffect(() => {
    if (projectsData.length === 0) {
      crypto.subtle
        .importKey('raw', cipherstring.buffer, 'AES-CTR', false, ['decrypt'])
        .then(e =>
          new ProjectDataArrayEncrypted(e, projectDataOriginal).Getter(
            (projectData: Array<ProjectData>) => {
              if (output.length !== 0) {
                return;
              }
              output = output.concat(
                projectData.toSorted((a, b) => b.year - a.year)
              );
              output = output.concat(GameToolsProjectsList);
              output = output.concat(otherProjectsDataList);
              setProjectsData(output);
            }
          )
        );
    }
  }, [
    GameToolsProjectsList,
    otherProjectsDataList,
    projectDataOriginal,
    projectsData,
  ]);
  function ProjectCardBuilder(projectTypeFilter: {
    [id: string]: projectType;
  }): void {
    setProjectsData(
      output
        .filter(e => {
          return (
            (e.type === projectTypeEnum.Tool &&
              projectTypeFilter['otherProjects'].activated) ||
            (e.type === projectTypeEnum.Game &&
              projectTypeFilter['game'].activated) ||
            (e.type === projectTypeEnum.GameTool &&
              projectTypeFilter['gametools'].activated)
          );
        })
        .filter(project =>
          [...filterStack].every(fs => project.stack.includes(fs))
        )
        .toSorted((a, b) => b.year - a.year)
        .toSorted((a, b) => a.type - b.type)
    );
  }

  function OpenProjectModal(id: string) {
    setProjectData(output.find(e => e.id === id));
    setOpenModal(true);
  }

  function ChangedFilter(e: string) {
    filterStack.has(e) ? filterStack.delete(e) : filterStack.add(e);
    ProjectCardBuilder(projectTypeFilter);
  }

  function ToggleChanged(output: {[id: string]: projectType}) {
    projectTypeFilter = output;
    ProjectCardBuilder(projectTypeFilter);
  }

  return (
    <>
      <div className="flex flex-col">
        <ButtonGroup
          projectTypeFilter={projectTypeFilter}
          callback={ToggleChanged}
        />
        <div className="flex flex-row">
          <Drawer
            className="lg:invisible"
            open={openFilterSidebar}
            onClose={() => setOpenFilterSidebar(false)}
          >
            <Drawer.Header title="Filter Drawer" />
            <Drawer.Items>
              <Types
                projectsData={projectsData}
                _filterStack={filterStack}
                callback={ChangedFilter}
              />
            </Drawer.Items>
          </Drawer>
          <Types
            className="collapse lg:visible"
            projectsData={projectsData}
            _filterStack={filterStack}
            callback={ChangedFilter}
          />
          <ProjectCards
            callback={OpenProjectModal}
            projectdata={projectsData}
          />
        </div>
        <ProjectModal
          projectData={projectData}
          openModalStatus={openModalStatus}
          closeCallback={() => setOpenModal(false)}
        />
        <div className="visible lg:invisible fixed bottom-10 right-10">
          <Button
            onClick={() => {
              setOpenFilterSidebar(true);
            }}
          >
            <HiFilter className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </>
  );
}
