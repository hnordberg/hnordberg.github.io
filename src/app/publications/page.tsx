import Image from 'next/image';
import './style.css';

const PublicationsPage = () => {
  return (
    <main>
      <div className="publications-container">
        <ul>
          <li>
            <strong>Data Visualization</strong> Michael Cantor, Henrik Nordberg, et al.,
            <a href="https://doi.org/10.1186/s12859-015-0566-4"> Elviz – exploration of metagenome assemblies with an
              interactive visualization tool</a>, BMC Bioinformatics 2015 16:130, DOI: 10.1186/s12859-015-0566-4;
              AngularJS based visualization tool available at <a href="http://genome.jgi.doe.gov/viz">http://genome.jgi.doe.gov/viz</a>
          </li>
          <li>
            <strong>Big Data</strong> Henrik Nordberg et al.,
            <a href="https://doi.org/10.1093/bioinformatics/btt528">BioPig: a Hadoop-based analytic toolkit for large-scale
              sequence data</a>, Bioinformatics (2013) 29 (23):3014-3019
          </li>
          <li>
            <strong>Data Analysis</strong> Henrik P. Nordberg and
            <a href="https://www.lbl.gov/people/excellence/nobelists/george-f-smoot-iii/">George F. Smoot</a>
            (Nobel Laureate, <a href="https://www.nobelprize.org/prizes/physics/2006/summary/">Physics, 2006</a>):
            <a href="https://arxiv.org/abs/astro-ph/9805123">The Cosmic Microwave Background Spectrum: an Analysis of Observations</a>
          </li>
          <li>
            <strong>Large Scale Data Management</strong> Arie Shoshani, Luis M. Bernardo, Henrik Nordberg, Doron Rotem, Alex Sim:
            Multidimensional Indexing and Query Coordination for Tertiary Storage Management
            <a href="https://dblp.org/db/conf/ssdbm/ssdbm1999.html">SSDBM 1999</a>: 214-225
          </li>
          <li>
            <strong>Science Web Portal</strong> Igor Grigoriev, Henrik Nordberg, et al., <a href="https://doi.org/10.1093/nar/gkr947">
            The Genome Portal of the Department of Energy</a> Nucl. Acids Res. (2012) 40 (D1):D26-D32
          </li>
        </ul>
      </div>
    </main>
  );
};

export default PublicationsPage;
